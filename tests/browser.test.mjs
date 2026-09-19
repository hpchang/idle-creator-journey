import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ACTIVE_MEDIA, MEDIA_BY_PLACEMENT, MEDIA_SOURCES } from "../src/data/media.mjs";
import { MEMBERS } from "../src/data/members.mjs";
import { SOURCE_LIST, SOURCE_TIERS } from "../src/data/sources.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = process.env.IDLE_BASE_URL ?? "http://127.0.0.1:4173";
const BASE_PATH = new URL(BASE_URL).pathname.replace(/\/$/, "");
const VIEWPORTS = [360, 390, 768, 1024, 1280, 1440];
const CSS_ROUTES = ["/css/tokens.css", "/css/base.css", "/css/layout.css", "/css/components.css", "/css/game.css"];
const EXPECTED_GAME_METRICS = ["clarity", "music", "reach", "health", "brand"];
const EXPECTED_MEDIA_COUNT = ACTIVE_MEDIA.length;
const EXPECTED_MEDIA_IDS = ACTIVE_MEDIA.map((media) => media.id).sort();
const HERO_MEDIA_ID = MEDIA_BY_PLACEMENT.hero.id;
const EXPECTED_MEMBER_FALLBACKS = MEMBERS.filter((member) => !member.mediaId).length;

let playwright;
let importError;
try {
  playwright = await import("playwright");
} catch (error) {
  importError = error;
}
let axeCore;
let axeImportError;
try {
  axeCore = await import("axe-core");
} catch (error) {
  axeImportError = error;
}

if (!playwright) throw new Error(`Playwright is required for browser verification: ${importError?.message ?? "import failed"}`);
if (!axeCore) throw new Error(`axe-core is required for accessibility verification: ${axeImportError?.message ?? "import failed"}`);
const axeSource = axeCore.source ?? axeCore.default?.source;
if (!axeSource) throw new Error("axe-core loaded without an injectable source bundle");

let serverProcess;
let browser;
let browserError;

async function isServerReady() {
  try {
    const response = await fetch(`${BASE_URL}/index.html`, { signal: AbortSignal.timeout(750) });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isServerReady()) return;
  if (process.env.IDLE_BASE_URL) throw new Error(`Configured IDLE_BASE_URL is unavailable: ${BASE_URL}`);
  serverProcess = spawn("npm", ["run", "serve", "--", "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (await isServerReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("local static server did not become ready");
}

async function launchRealChrome() {
  const { chromium } = playwright;
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    const candidates = [
      process.env.CHROME_PATH,
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ].filter(Boolean);
    for (const executablePath of candidates) {
      if (!fs.existsSync(executablePath)) continue;
      try {
        return await chromium.launch({ executablePath, headless: true });
      } catch {
        // Try the next installed browser binary.
      }
    }
    return chromium.launch({ headless: true });
  }
}

/* 計數器 host 攔截。每個 viewport 都是全新 context，sessionStorage 因此
   每次都是空的，計數器會走「第一次」分支——若放行到真實端點，每跑一次
   測試就會對正式計數累加 6 次以上。stub 掉之後測試既不會污染正式數字，
   也不受外部服務可用性影響（page.__failedRequests 的斷言因此不會因
   計數器不可達而失敗），且可斷言動詞是 POST 還是 GET。 */
const COUNTER_STUB_COUNT = 42;
const COUNTER_ROUTE = /^https:\/\/[^/]*views-counter[^/]*\//;

async function stubCounter(context, log, { status = 200, count = COUNTER_STUB_COUNT } = {}) {
  await context.route(COUNTER_ROUTE, (route) => {
    log.push(route.request().method());
    return route.fulfill({
      status,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ count }),
    });
  });
}

async function newPage({ viewport, clipboardDenied = false, counterStub = {} } = {}) {
  const context = await browser.newContext({ viewport: { width: viewport, height: 900 }, reducedMotion: "reduce" });
  const counterRequests = [];
  await stubCounter(context, counterRequests, counterStub);
  if (clipboardDenied) {
    await context.addInitScript(() => {
      const clipboard = { writeText: () => Promise.reject(new Error("clipboard denied")) };
      try {
        Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: clipboard });
      } catch {
        // The test still verifies the app's fallback if the browser exposes a writable clipboard.
      }
    });
  }
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") page.__consoleErrors ??= [], page.__consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    page.__pageErrors ??= [], page.__pageErrors.push(String(error));
  });
  page.on("requestfailed", (request) => {
    page.__failedRequests ??= [], page.__failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`);
  });
  page.__responses = [];
  page.on("response", (response) => page.__responses.push({ url: response.url(), status: response.status() }));
  page.__counterRequests = counterRequests;
  return { context, page };
}

async function load(page, suffix = "") {
  const response = await page.goto(`${BASE_URL}/index.html${suffix}`, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  await page.waitForSelector("main#main-content");
}

async function chooseRadio(page, name, index) {
  const radio = page.locator(`input[name="${name}"]`).nth(index);
  await radio.focus();
  await radio.press("Space");
}

async function setAllocationWithKeyboard(page, values) {
  for (const [key, value] of Object.entries(values)) {
    for (let count = 0; count < value; count += 1) {
      const input = page.locator(`[data-allocation-input="${key}"]`);
      await input.focus();
      await input.press("ArrowUp");
    }
  }
}

async function runKeyboardRoute(page, { seed, themeIndex, productionIndex, eventChoiceIndex }) {
  await load(page, `?seed=${seed}`);
  await chooseRadio(page, "theme", themeIndex);
  await page.locator('[data-action="next-step"]').focus();
  await page.locator('[data-action="next-step"]').press("Enter");
  await chooseRadio(page, "production", productionIndex);
  await page.locator('[data-action="next-step"]').focus();
  await page.locator('[data-action="next-step"]').press("Enter");
  await setAllocationWithKeyboard(page, { music: 2, stage: 2, mv: 2, promo: 2, rest: 2 });
  assert.equal(await page.locator('[data-action="next-step"]').isDisabled(), false);
  await page.locator('[data-action="next-step"]').focus();
  await page.locator('[data-action="next-step"]').press("Enter");
  await chooseRadio(page, "event-choice", eventChoiceIndex);
  await page.locator('[data-action="next-step"]').focus();
  await page.locator('[data-action="next-step"]').press("Enter");
  await page.waitForSelector(".result-card");
  assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute("data-result-panel")), true, "result panel must receive focus");
  const resultText = await page.locator(".result-card").innerText();
  assert.match(resultText, /企劃完成：你做了 5 個決定。/);
  assert.match(resultText, /這次的決策傾向/);
  assert.match(resultText, /這不是固定人格或能力測驗/);
  assert.doesNotMatch(resultText, /(?:銷量|榜單|排名|收入|薪資|美元|韓元)/);
}

before(async () => {
  if (!playwright) return;
  try {
    await ensureServer();
    browser = await launchRealChrome();
  } catch (error) {
    browserError = error;
  }
});

after(async () => {
  if (browser) await browser.close();
  if (serverProcess) serverProcess.kill("SIGTERM");
});

function skipReason() {
  if (browserError) return `No usable installed Chrome/Chromium: ${browserError.message}`;
  return false;
}

test("real-browser load, resource, overflow, and responsive checks cover all required viewports", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  for (const width of VIEWPORTS) {
    await t.test(`viewport ${width}px`, async () => {
      const { context, page } = await newPage({ viewport: width });
      try {
        await load(page, "?seed=0");
        assert.equal(await page.locator("img").count(), EXPECTED_MEDIA_COUNT);
        const heroImage = page.locator(`[data-media-id="${HERO_MEDIA_ID}"] img`);
        assert.equal(await heroImage.getAttribute("loading"), "eager");
        assert.equal(await heroImage.getAttribute("fetchpriority"), "high");
        const mediaFigures = page.locator("[data-media-id]");
        for (let index = 0; index < await mediaFigures.count(); index += 1) await mediaFigures.nth(index).scrollIntoViewIfNeeded();
        await page.waitForFunction((expected) => {
          const images = [...document.querySelectorAll("img")];
          return images.length === expected && images.every((image) => image.complete && image.naturalWidth > 0);
        }, EXPECTED_MEDIA_COUNT);
        const imageData = await page.locator("img").evaluateAll((images) => images.map((image) => ({
          src: image.getAttribute("src"),
          alt: image.getAttribute("alt"),
          width: image.getAttribute("width"),
          height: image.getAttribute("height"),
          loading: image.getAttribute("loading"),
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        })));
        assert.ok(imageData.every((image) => image.src?.startsWith("assets/images/commons/") && image.alt && Number(image.width) > 0 && Number(image.height) > 0));
        assert.ok(imageData.every((image) => image.naturalWidth === Number(image.width) && image.naturalHeight === Number(image.height)), "declared image dimensions must match local assets");
        assert.equal(await page.locator(".member-card__media--fallback").count(), EXPECTED_MEMBER_FALLBACKS);
        assert.equal(imageData.filter((image) => image.loading === "lazy").length, EXPECTED_MEDIA_COUNT - 2, "hero and first member portrait load eagerly");
        const renderedMedia = await page.locator("[data-media-id]").evaluateAll((figures) => figures.map((figure) => ({ id: figure.dataset.mediaId, photoId: figure.dataset.photoId })));
        assert.deepEqual(renderedMedia.map(({ id }) => id).sort(), EXPECTED_MEDIA_IDS);
        assert.equal(new Set(renderedMedia.map(({ photoId }) => photoId)).size, EXPECTED_MEDIA_COUNT, "each rendered slot must use a different original photo");
        assert.equal(renderedMedia.some(({ id }) => id.startsWith("idle-2025-")), false, "retired SBS crops must not render");
        const statuses = new Map(page.__responses.map(({ url, status }) => [new URL(url).pathname, status]));
        for (const route of CSS_ROUTES) assert.equal(statuses.get(`${BASE_PATH}${route}`), 200, `${route} must load with HTTP 200`);
        const badLocalResponses = page.__responses.filter(({ url, status }) => status >= 400 && new URL(url).origin === new URL(BASE_URL).origin);
        assert.deepEqual(badLocalResponses, [], `local resources must not return HTTP errors at ${width}px`);
        assert.deepEqual(page.__consoleErrors ?? [], [], `console errors at ${width}px`);
        assert.deepEqual(page.__pageErrors ?? [], [], `page errors at ${width}px`);
        assert.deepEqual(page.__failedRequests ?? [], [], `failed requests at ${width}px`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), await page.evaluate(() => document.documentElement.clientWidth), `horizontal overflow at ${width}px`);
        const clipped = await page.locator("h1,h2,h3,button,input,textarea").evaluateAll((elements) => elements.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > document.documentElement.clientWidth + 1);
        }).map((element) => element.outerHTML.slice(0, 120)));
        assert.deepEqual(clipped, [], `visible controls/headings are clipped at ${width}px`);

        // Narrative expansion: every content chapter (2–12) has a story block, and no
        // narrative paragraph exceeds a comfortable line length at small viewports.
        const narrativeCount = await page.locator("[data-narrative] .story-block").count();
        assert.ok(narrativeCount >= 11, `expected at least 11 narrative story blocks at ${width}px, got ${narrativeCount}`);
        const longLines = await page.locator(".narrative-paragraph").evaluateAll((paragraphs) => paragraphs.map((p) => Math.round(p.getBoundingClientRect().width)).filter((w) => w > 0));
        const maxLine = longLines.length ? Math.max(...longLines) : 0;
        assert.ok(maxLine <= width + 1, `narrative paragraph must not overflow at ${width}px (max ${maxLine}px)`);
      } finally {
        await context.close();
      }
    });
  }
});

test("axe-core scans each required viewport for WCAG regressions", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  for (const width of VIEWPORTS) {
    await t.test(`axe viewport ${width}px`, async () => {
      const { context, page } = await newPage({ viewport: width });
      try {
        await load(page, "?seed=0");
        await page.addScriptTag({ content: axeSource });
        const result = await page.evaluate(async () => window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] }));
        assert.deepEqual(result.violations, [], JSON.stringify(result.violations, null, 2));
      } finally {
        await context.close();
      }
    });
  }
});

test("keyboard-only navigation and game flow preserve focus, source links, and copy fallback", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 390, clipboardDenied: true });
  try {
    await load(page, "?seed=0");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("href")), "#main-content", "skip link must be first keyboard target");

    const toc = page.locator(".toc-toggle");
    await toc.focus();
    await toc.press("Enter");
    assert.equal(await toc.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await toc.getAttribute("aria-expanded"), "false", "Escape must close the chapter menu");
    assert.equal(await page.evaluate(() => document.activeElement?.className), "toc-toggle", "closing the menu must restore focus");
    await toc.press("Enter");
    await page.locator('[data-nav-link="comeback-game"]').focus();
    await page.locator('[data-nav-link="comeback-game"]').press("Enter");
    assert.equal(await toc.getAttribute("aria-expanded"), "false");
    assert.equal(await page.evaluate(() => location.hash), "#comeback-game");

    const range = page.locator("#restart-range");
    const oldOutput = await page.locator("[data-restart-output]").textContent();
    await range.focus();
    await range.press("ArrowRight");
    assert.notEqual(await page.locator("[data-restart-output]").textContent(), oldOutput, "range must update by keyboard");

    await page.locator('input[name="theme"]').first().focus();
    await page.locator('input[name="theme"]').first().press("ArrowRight");
    assert.equal(await page.locator('input[name="theme"]').nth(1).isChecked(), true, "radio arrows must change the selected theme");
    await page.locator('[data-action="next-step"]').focus();
    await page.locator('[data-action="next-step"]').press("Enter");
    await page.locator('input[name="production"]').first().focus();
    await page.locator('input[name="production"]').first().press("Space");
    await page.locator('[data-action="next-step"]').focus();
    await page.locator('[data-action="next-step"]').press("Enter");
    assert.equal(await page.locator('[data-action="next-step"]').isDisabled(), true, "allocation cannot advance before exactly ten points");
    const musicIncrement = page.locator('[data-action="increment"][data-allocation="music"]');
    const musicDecrement = page.locator('[data-action="decrement"][data-allocation="music"]');
    const allocationScroll = await page.evaluate(() => window.scrollY);
    await musicIncrement.focus();
    await musicIncrement.press("Enter");
    assert.equal(await page.locator('[data-allocation-input="music"]').inputValue(), "1");
    assert.equal(await page.evaluate(() => window.scrollY), allocationScroll, "allocation controls must not move the viewport");
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.action), "increment", "allocation control keeps focus for repeated input");
    await musicDecrement.focus();
    await musicDecrement.press("Enter");
    assert.equal(await page.locator('[data-allocation-input="music"]').inputValue(), "0");
    await setAllocationWithKeyboard(page, { music: 2, stage: 2, mv: 2, promo: 2, rest: 2 });
    const allocationInput = page.locator('[data-allocation-input="music"]');
    const keyboardScroll = await page.evaluate(() => window.scrollY);
    await allocationInput.focus();
    await allocationInput.press("ArrowUp");
    assert.equal(await page.evaluate(() => window.scrollY), keyboardScroll, "allocation arrow keys must not move the viewport");
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.allocationInput), "music", "allocation input keeps focus for repeated arrow-key input");
    assert.equal(await page.locator('[data-action="next-step"]').isDisabled(), true, "over-allocation cannot advance");
    assert.match(await page.locator("#allocation-status").textContent(), /11/);
    await page.locator('[data-allocation-input="music"]').focus();
    await page.locator('[data-allocation-input="music"]').press("ArrowDown");
    await page.locator('[data-action="next-step"]').focus();
    await page.locator('[data-action="next-step"]').press("Enter");
    await page.locator('input[name="event-choice"]').first().focus();
    await page.locator('input[name="event-choice"]').first().press("Space");
    await page.locator('[data-action="next-step"]').focus();
    await page.locator('[data-action="next-step"]').press("Enter");
    await page.waitForSelector(".result-card");

    await page.locator('[data-action="copy-result"]').focus();
    await page.locator('[data-action="copy-result"]').press("Enter");
    await page.waitForFunction(() => document.querySelector("[data-copy-status]")?.textContent.includes("手動複製"));
    assert.equal(await page.evaluate(() => document.activeElement?.id), "share-text", "copy fallback must focus and select share text");
    assert.equal(await page.evaluate(() => document.activeElement?.selectionStart < document.activeElement?.selectionEnd), true);

    await page.locator('[data-action="reset-game"]').focus();
    await page.locator('[data-action="reset-game"]').press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement?.name), "theme", "reset must focus first game choice");

    const mediaCreditData = await page.locator(".media-credit").evaluateAll((credits) => credits.map((credit) => ({
      text: credit.textContent,
      licenseId: credit.querySelector('a[href^="#media-license-"]')?.textContent.trim(),
      externalLinks: [...credit.querySelectorAll('a[href^="https://"]')].map((link) => link.textContent.trim()),
    })));
    assert.equal(mediaCreditData.length, EXPECTED_MEDIA_COUNT);
    assert.ok(mediaCreditData.every(({ text, licenseId, externalLinks }) => /^M\d+$/.test(licenseId) && externalLinks.length === 2 && /CC BY/.test(text)), "figure credits must keep a concise M ID, author, and licence");
    assert.equal(mediaCreditData.some(({ text }) => text.includes("SBS Radio")), false, "retired SBS source must not appear in active figure credits");
    assert.equal(await page.locator(".media-license-card").count(), MEDIA_SOURCES.length);
    const mediaLinks = await page.locator(".media-credit a, .media-license-card a").evaluateAll((links) => links.map((link) => ({
      href: link.href,
      origin: new URL(link.href).origin,
      target: link.target,
      rel: link.rel,
      hash: link.hash,
      targetExists: link.hash ? Boolean(document.querySelector(link.hash)) : null,
    })));
    const pageOrigin = await page.evaluate(() => location.origin);
    const externalMediaLinks = mediaLinks.filter((link) => link.origin !== pageOrigin && /^https:\/\//.test(link.href));
    const internalMediaLinks = mediaLinks.filter((link) => /^#media-license-/.test(link.hash));
    assert.ok(externalMediaLinks.length >= EXPECTED_MEDIA_COUNT * 2 + MEDIA_SOURCES.length * 2);
    assert.ok(externalMediaLinks.every((link) => link.target === "_blank" && /noopener/.test(link.rel) && /noreferrer/.test(link.rel)));
    assert.equal(internalMediaLinks.length, EXPECTED_MEDIA_COUNT);
    assert.ok(internalMediaLinks.every((link) => link.targetExists));
    assert.ok(mediaLinks.some((link) => /creativecommons\.org/.test(link.href) && /license/.test(link.rel)));

    const externalLinks = await page.locator(".source-entry a.text-link").evaluateAll((links) => links.map((link) => ({ href: link.href, target: link.target, rel: link.rel })));
    assert.equal(externalLinks.length, SOURCE_LIST.length, "every source entry keeps its original link");
    assert.equal(await page.locator(".source-group").count(), SOURCE_TIERS.length + 1, "one accordion per credibility tier plus the image-licence group");
    assert.equal(await page.locator(".source-group[open]").count(), 0, "every source group starts collapsed");
    for (const link of externalLinks) {
      assert.match(link.href, /^https:\/\//);
      assert.equal(link.target, "_blank");
      assert.match(link.rel, /noopener/);
      assert.match(link.rel, /noreferrer/);
    }
    const badgeData = await page.locator(".source-badge").evaluateAll((links) => links.map((link) => ({ name: link.getAttribute("aria-label") || link.textContent.trim(), href: link.getAttribute("href"), targetExists: Boolean(document.querySelector(link.getAttribute("href"))) })));
    assert.ok(badgeData.length > 0);
    assert.ok(badgeData.every(({ name, href, targetExists }) => /S\d+[A-Z]?：/.test(name) && /^#source-S\d+[A-Z]?$/.test(href) && targetExists), "source badges need understandable names and valid targets");
    assert.match(await page.locator("#source-S05 .source-entry__chapters").textContent(), /03 五條不同的路/);
    assert.match(await page.locator("#source-S06 .source-entry__chapters").textContent(), /03 五條不同的路/);
  } finally {
    await context.close();
  }
});

test("source badges open the collapsed group that holds the entry they point at", { timeout: 60_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 390 });
  try {
    await load(page, "?seed=0");

    // Following a badge must reveal, scroll to, and focus the entry it names.
    const badge = page.locator('a[href="#source-S12"]').first();
    await badge.scrollIntoViewIfNeeded();
    await badge.click();
    await page.waitForFunction(() => document.activeElement?.id === "source-S12");
    assert.equal(await page.locator("#source-S12").isVisible(), true, "the badge target must not stay hidden inside a closed accordion");
    assert.equal(await page.locator(".source-group[open]").count(), 1, "only the owning group opens");

    // A shared deep link must work on a cold load too.
    const direct = await newPage({ viewport: 390 });
    try {
      await load(direct.page, "?seed=0#source-S20");
      await direct.page.waitForFunction(() => document.activeElement?.id === "source-S20");
      assert.equal(await direct.page.locator("#source-S20").isVisible(), true);
    } finally {
      await direct.context.close();
    }

    const toggle = page.locator("[data-action='toggle-all-sources']");
    await toggle.focus();
    await toggle.press("Enter");
    assert.equal(await page.locator(".source-group[open]").count(), SOURCE_TIERS.length + 1);
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    await toggle.press("Enter");
    assert.equal(await page.locator(".source-group[open]").count(), 0);
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
  } finally {
    await context.close();
  }
});

test("redesign exposes one primary route, four scenes, focus-safe navigation, and resumable reading", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 390 });
  try {
    await load(page, "?seed=0");
    assert.equal(await page.locator(".hero__actions .button--primary").count(), 1);
    assert.equal(await page.locator('[data-route="story"]').textContent(), "先走完整故事");
    assert.equal(await page.locator('[data-route="game"]').textContent(), "我已了解背景，直接玩");
    assert.match(await page.locator(".hero__actions").innerText(), /10 分鐘/);
    assert.match(await page.locator(".hero__actions").innerText(), /4–6 分鐘/);

    const factPositions = await page.locator(".quick-fact").evaluateAll((items) => items.map((item) => ({ left: item.getBoundingClientRect().left, top: item.getBoundingClientRect().top })));
    assert.equal(new Set(factPositions.map(({ left }) => Math.round(left))).size, 1, "390px Hero facts must use one column");
    assert.ok(factPositions[1].top > factPositions[0].top && factPositions[2].top > factPositions[1].top);

    // The hero editor-defence note must not be present in the DOM at all.
    assert.equal(await page.locator(".hero__note").count(), 0, "hero__note must be removed from the DOM");
    assert.equal(await page.locator("text=首頁問題是編輯提問，不是成員名言").count(), 0, "hero editor note text must not be rendered");

    // Chapter 13's editorial boundary rule appears exactly once and is visible.
    assert.equal(await page.locator("[data-editorial-rule]").count(), 1, "editorial rule must appear once");
    assert.ok(await page.locator("[data-editorial-rule]").first().isVisible(), "editorial rule must be visible");
    assert.match(await page.locator("[data-editorial-rule]").textContent(), /未加署名的章節標題、提問與反思句/);

    const scenes = await page.locator("[data-chapter]").evaluateAll((sections) => [...new Set(sections.map((section) => section.dataset.scene))].sort());
    assert.deepEqual(scenes, ["archive", "creation", "rehearsal", "stage"]);
    const authored = await page.locator('[data-chapter]:not(#sources) [data-authored-unit]').evaluateAll((items) => ({ total: items.length, flat: items.filter((item) => item.dataset.treatment === "flat").length }));
    assert.ok(authored.total > 0 && authored.flat / authored.total >= 0.4, `flat authored ratio is ${authored.flat}/${authored.total}`);

    const toc = page.locator(".toc-toggle");
    await toc.focus();
    await toc.press("Enter");
    await page.locator('[data-nav-link="paths"]').click();
    await page.waitForFunction(() => document.activeElement?.id === "paths-title");
    assert.equal(await page.evaluate(() => location.hash), "#paths");
    const offset = await page.evaluate(() => ({ headingTop: document.querySelector("#paths-title").getBoundingClientRect().top, headerHeight: document.querySelector(".site-header").getBoundingClientRect().height }));
    assert.ok(offset.headingTop >= offset.headerHeight - 2, JSON.stringify(offset));

    await toc.focus();
    await toc.press("Enter");
    await page.locator("#paths .section-heading").click({ position: { x: 8, y: 8 } });
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains("toc-toggle")), true, "outside click must restore TOC focus");

    await page.evaluate(() => { location.hash = "#source-["; });
    await page.waitForTimeout(50);
    assert.deepEqual(page.__pageErrors ?? [], []);

    await page.evaluate(() => {
      sessionStorage.setItem("idle-creator-journey:reading:v1", JSON.stringify({ version: 1, chapterId: "restart", chapterNumber: "07", label: "像重新出道", updatedAt: new Date().toISOString() }));
      history.replaceState(null, "", location.pathname + location.search);
    });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-resume-cue]").isVisible(), true);
    await page.locator('[data-resume-action="continue"]').click();
    await page.waitForFunction(() => document.activeElement?.id === "restart-title");
  } finally {
    await context.close();
  }
});

test("decision-first game and source archive expose progressive details", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 390 });
  try {
    await load(page, "?seed=0#comeback-game");
    const order = await page.evaluate(() => {
      const selectors = [".game-situation", ".game-notice", ".game-steps", "[data-game-decision]", ".game-controls", ".game-dashboard", "[data-game-status]"];
      return selectors.map((selector) => [...document.querySelectorAll("#game-app *")].indexOf(document.querySelector(`#game-app ${selector}`)));
    });
    assert.ok(order.every((value, index) => index === 0 || value > order[index - 1]), `unexpected game order: ${order}`);
    assert.equal(await page.locator('[data-action="next-step"]').isDisabled(), true);
    assert.match(await page.locator("#next-step-reason").textContent(), /請先選擇/);
    assert.equal(await page.locator(".game-metrics-details").getAttribute("open"), null);
    assert.equal(await page.locator(".game-metrics-details meter").count(), EXPECTED_GAME_METRICS.length);
    await page.locator(".game-metrics-details summary").click();

    await chooseRadio(page, "theme", 0);
    assert.equal(await page.locator(".game-metrics-details").getAttribute("open"), "");
    assert.equal(await page.locator('[data-action="next-step"]').isDisabled(), false);
    assert.match(await page.locator(".game-choice--selected .game-choice__impact").innerText(), /主要影響/);
    assert.match(await page.locator(".game-choice--selected .game-choice__impact").innerText(), /[+-]\d/);

    const filter = page.locator("[data-source-filter]");
    await filter.scrollIntoViewIfNeeded();
    await filter.fill("Spotify");
    assert.match(await page.locator("[data-source-filter-status]").textContent(), /找到 \d+ 筆/);
    assert.ok(await page.locator("[data-source-entry]:visible").count() >= 1);
    await page.locator('a[href="#source-S06"]').first().click();
    await page.waitForFunction(() => document.activeElement?.id === "source-S06");
    assert.equal(await filter.inputValue(), "", "source deep link must clear a filter that hides its target");
    assert.equal(await page.locator("#source-S06").isVisible(), true);

    const mediaLink = page.locator('.media-credit a[href^="#media-license-"]').first();
    await mediaLink.click();
    await page.waitForFunction(() => document.activeElement?.id?.startsWith("media-license-"));
    const activeMediaId = await page.evaluate(() => document.activeElement.id);
    const audit = page.locator(`#${activeMediaId} .media-license-card__audit`);
    await audit.locator("summary").click();
    assert.match(await audit.innerText(), /查閱日期/);
    assert.match(await audit.innerText(), /雜湊/);
  } finally {
    await context.close();
  }
});

test("every theme, production choice, event seed, and event-choice path reaches a browser result", { timeout: 180_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 768 });
  try {
    // Every theme and production pair is exercised, plus every integer seed and choice.
    for (let themeIndex = 0; themeIndex < 5; themeIndex += 1) {
      for (let productionIndex = 0; productionIndex < 3; productionIndex += 1) {
        await runKeyboardRoute(page, { seed: 0, themeIndex, productionIndex, eventChoiceIndex: 0 });
      }
    }
    for (let seed = 0; seed < 5; seed += 1) {
      for (let eventChoiceIndex = 0; eventChoiceIndex < 3; eventChoiceIndex += 1) {
        await runKeyboardRoute(page, { seed, themeIndex: 0, productionIndex: 0, eventChoiceIndex });
      }
    }
  } finally {
    await context.close();
  }
});

test("desktop viewports use two-column chapter layout and keep narrative line length bounded", { timeout: 120_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  for (const width of [1024, 1440]) {
    await t.test(`desktop layout ${width}px`, async () => {
      const { context, page } = await newPage({ viewport: width });
      try {
        await load(page, "?seed=0");
        // Chapter 02 uses a two-column chapter-layout grid on desktop.
        const chapterLayout = await page.locator('[data-chapter-layout="who"]').evaluateAll((els) => els.map((el) => {
          const cols = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean);
          return { count: cols.length, width: el.getBoundingClientRect().width };
        }));
        assert.equal(chapterLayout.length, 1, "chapter 02 should have a chapter-layout container");
        assert.ok(chapterLayout[0].count >= 2, `chapter 02 should use at least 2 columns at ${width}px, got ${chapterLayout[0].count}`);

        // No narrative paragraph line should exceed a comfortable reading width.
        const widestNarrative = await page.locator(".narrative-paragraph").evaluateAll((paragraphs) => Math.max(0, ...paragraphs.map((p) => Math.round(p.getBoundingClientRect().width))));
        assert.ok(widestNarrative <= 44 * 16, `narrative line length should stay <= ~44rem at ${width}px, got ${widestNarrative}px`);

        // Desktop should not rely on CSS order to reorder DOM at any chapter.
        const orderedChapters = await page.evaluate(() => {
          const sections = [...document.querySelectorAll(".stage-section[data-chapter]")];
          return sections.map((section) => {
            const children = [...section.children].flatMap((c) => [...c.querySelectorAll(":scope > *, :scope .section-shell > *")]);
            const storyEls = [...section.querySelectorAll(".story-block, .timeline, .member-grid, .credit-grid, .income-map, .role-board, .game-app")];
            return storyEls.map((el) => Number(getComputedStyle(el).order || 0));
          });
        });
        assert.ok(orderedChapters.every((orders) => orders.every((o) => o === 0)), `no CSS order reordering should be used at ${width}px`);

        // All source badges in narrative content must point at existing source entries.
        const badgeTargets = await page.locator(".narrative-paragraph .source-badge, .member-card__observation .source-badge").evaluateAll((badges) => badges.map((b) => b.getAttribute("href")).map((href) => ({ href, exists: Boolean(document.querySelector(href)) })));
        assert.ok(badgeTargets.length > 0, "narrative content should carry source badges");
        assert.ok(badgeTargets.every((b) => b.exists && /^#source-S/.test(b.href)), "all narrative source badges must resolve to a source entry");
      } finally {
        await context.close();
      }
    });
  }
});

test("reduced-motion mode disables motion and retains live status, labels, and landmarks", { timeout: 60_000 }, async (t) => {
  if (skipReason()) return t.skip(skipReason());
  const { context, page } = await newPage({ viewport: 390 });
  try {
    await load(page, "?seed=0");
    const motion = await page.evaluate(() => {
      const elements = [document.documentElement, document.body, ...document.querySelectorAll("*")];
      const durations = elements.flatMap((element) => {
        const style = getComputedStyle(element);
        return [style.animationDuration, style.transitionDuration].map((value) => Number.parseFloat(value) || 0);
      });
      return {
        maxDuration: Math.max(...durations),
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        liveRegions: document.querySelectorAll('[aria-live]').length,
        duplicateIds: [...document.querySelectorAll("[id]")].map((element) => element.id).filter((id, index, ids) => ids.indexOf(id) !== index),
        labelledInputs: [...document.querySelectorAll("input,textarea,meter")].filter((element) => !element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby") && !element.closest("label") && !element.id).map((element) => element.outerHTML),
      };
    });
    assert.ok(motion.maxDuration <= 0.02, `motion duration must be effectively disabled, got ${motion.maxDuration}s`);
    assert.equal(motion.scrollBehavior, "auto");
    assert.ok(motion.liveRegions > 0);
    assert.deepEqual(motion.duplicateIds, []);
    assert.deepEqual(motion.labelledInputs, []);
    assert.equal(await page.locator("main#main-content").count(), 1);
    assert.equal(await page.locator("header.site-header").count(), 1);
    assert.equal(await page.locator("nav[aria-label='章節導覽']").count(), 1);
    const dashboard = page.locator(".game-dashboard");
    assert.ok((await dashboard.getAttribute("aria-label")) || (await dashboard.getAttribute("aria-labelledby")));
    const meters = await page.locator("meter").evaluateAll((items) => items.map((meter) => ({ min: meter.min, max: meter.max, value: meter.value, labelled: Boolean(meter.getAttribute("aria-label") || meter.getAttribute("aria-labelledby") || meter.closest("label")) })));
    assert.ok(meters.length >= EXPECTED_GAME_METRICS.length);
    assert.ok(meters.every((meter) => meter.labelled && Number(meter.min) === 0 && Number(meter.max) === 100));
  } finally {
    await context.close();
  }
});
