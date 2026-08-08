import { SONG_CREDITS, CREDIT_ROLE_LABELS } from "./data/credits.mjs";
import { FACTS_BY_ID } from "./data/facts.mjs";
import { MEMBERS } from "./data/members.mjs";
import { ACTIVE_MEDIA, MEDIA, MEDIA_BY_ID, MEDIA_BY_PLACEMENT, MEDIA_SOURCES, RIGHTS_NOTICE } from "./data/media.mjs";
import {
  CHAPTERS,
  RESTART_STRATEGIES,
  SITE_META,
  TAKEAWAYS,
  TRAINEE_SCENARIO,
} from "./data/site.mjs";
import { SOURCE_LIST, groupSourcesByTier } from "./data/sources.mjs";
import { initGame } from "./game/controller.mjs";
import { initCounter } from "./counter.mjs";
import {
  escapeHtml,
  renderFact,
  renderMedia,
  renderMediaLicenseCard,
  renderMemberMediaFallback,
  renderSectionSources,
  renderSourceBadges,
  renderSourceGroup,
  renderSourceLibrary,
  setLiveMessage,
} from "./ui.mjs";

const select = (selector, root = document) => root.querySelector(selector);

function renderNavigation() {
  const nav = select("[data-chapter-nav]");
  const toggle = select(".toc-toggle");
  if (!nav || !toggle) return;
  nav.innerHTML = `<ol>${CHAPTERS.map(
    (chapter) => `<li><a href="#${chapter.id}" data-nav-link="${chapter.id}"><span>${chapter.number}</span>${escapeHtml(chapter.label)}</a></li>`,
  ).join("")}</ol>`;

  const links = () => [...nav.querySelectorAll("a")];
  const setOpen = (open, { restoreFocus = false } = {}) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) links()[0]?.focus();
    else if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      event.preventDefault();
      setOpen(false, { restoreFocus: true });
    }
  });
  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open") || nav.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });
}

function renderHeroMedia() {
  const root = select("[data-hero-media]");
  if (!root) return;
  root.innerHTML = renderMedia(MEDIA_BY_PLACEMENT.hero, {
    className: "hero-media__figure media-figure--wide",
    loading: "eager",
    priority: true,
  });
}

function renderQuickFacts() {
  const items = [
    ["2018", "六人出道", FACTS_BY_ID.debut],
    ["2022", "五人回歸", FACTS_BY_ID.hiatus],
    ["2025", "改名 i-dle", FACTS_BY_ID.rename],
  ];
  select("[data-quick-facts]").innerHTML = items
    .map(
      ([year, label, fact]) => `
      <article class="quick-fact">
        <span>${year}</span>
        <h2>${escapeHtml(label)}</h2>
        <p>${escapeHtml(fact.text)}</p>
        ${renderSourceBadges(fact.sourceIds)}
      </article>`,
    )
    .join("");
}

function renderTimeline() {
  const entries = [
    { year: "2018", title: "第一次出道", fact: FACTS_BY_ID.debut },
    { year: "2021", title: "團體改為五人體制", fact: FACTS_BY_ID["five-members"] },
    { year: "2022", title: "像重新出道的回歸", fact: FACTS_BY_ID.hiatus },
    { year: "2024", title: "五位成員宣布續約", fact: FACTS_BY_ID.renewal },
    { year: "2025", title: "名字進入下一章", fact: FACTS_BY_ID.rename },
  ];
  select("[data-timeline]").innerHTML = `${entries
    .map(
      ({ year, title, fact }) => `
      <article class="timeline-item">
        <div class="timeline-item__year">${year}</div>
        <div class="timeline-item__body">
          <h3>${escapeHtml(title)}</h3>
          ${renderFact(fact, { compact: true })}
        </div>
      </article>`,
    )
    .join("")}
    <div class="roster-summary" aria-label="出道與現行成員名單">
      ${renderFact(FACTS_BY_ID["original-members"])}
      ${renderFact(FACTS_BY_ID["current-members"])}
    </div>`;
}

function renderMembers() {
  select("[data-members]").innerHTML = MEMBERS.map(
    (member, index) => `
    <article class="member-card" style="--member-index: ${index}">
      <div class="member-card__tab"><span>FILE 0${index + 1}</span>${renderSourceBadges(member.sourceIds)}</div>
      ${member.mediaId
        ? renderMedia(MEDIA_BY_ID[member.mediaId], {
          className: "member-card__media media-figure--portrait",
          loading: "lazy",
          compactCredit: true,
          frameClass: "member-card__avatar",
        })
        : renderMemberMediaFallback(member)}
      <h3>${escapeHtml(member.name)}</h3>
      <dl>
        <div><dt>起點</dt><dd>${escapeHtml(member.start)}</dd></div>
        <div><dt>困難</dt><dd>${escapeHtml(member.challenge)}</dd></div>
        <div><dt>帶進團隊的能力</dt><dd>${escapeHtml(member.ability)}</dd></div>
      </dl>
      <blockquote>${escapeHtml(member.question)}</blockquote>
      <details>
        <summary>這張卡的資料限制</summary>
        <p>${escapeHtml(member.caveat)}</p>
      </details>
    </article>`,
  ).join("");
}

function renderTraineeScenario() {
  const root = select("[data-trainee-scenario]");
  root.innerHTML = `
    <div class="scenario-card">
      <div class="scenario-card__prompt">
        <span class="scenario-card__stamp">情境，不是測驗</span>
        <p>${escapeHtml(TRAINEE_SCENARIO.prompt)}</p>
        ${renderSectionSources(TRAINEE_SCENARIO.sourceIds)}
      </div>
      <fieldset>
        <legend>選一個你現在最可能做的決定</legend>
        <div class="scenario-choices">${TRAINEE_SCENARIO.choices
          .map(
            (choice) => `
            <label class="scenario-choice">
              <input type="radio" name="trainee-choice" value="${choice.id}" />
              <span>${escapeHtml(choice.label)}</span>
            </label>`,
          )
          .join("")}</div>
      </fieldset>
      <div class="scenario-result" data-scenario-result aria-live="polite">
        <p>選擇後，這裡會顯示你保護了什麼、又承擔了什麼。</p>
      </div>
    </div>`;

  root.addEventListener("change", (event) => {
    const choice = TRAINEE_SCENARIO.choices.find((item) => item.id === event.target.value);
    if (!choice) return;
    root.querySelectorAll(".scenario-choice").forEach((label) => label.classList.toggle("is-selected", label.contains(event.target)));
    root.querySelector("[data-scenario-result]").innerHTML = `<strong>${escapeHtml(choice.label)}</strong><p>${escapeHtml(choice.tradeoff)}</p>`;
  });
}

function renderDebut() {
  const roles = [
    ["演唱", "把歌曲變成聽得見的聲音與情緒"],
    ["作詞", "決定文字、敘事與語言節奏"],
    ["作曲", "建立旋律、和聲與歌曲骨架"],
    ["編曲", "安排聲響、樂器、段落與能量"],
    ["舞台", "把音樂轉成動作、隊形與現場體驗"],
    ["視覺", "用 MV、造型與設計延伸作品概念"],
  ];
  select("[data-debut-content]").innerHTML = `
    ${renderMedia(MEDIA_BY_PLACEMENT.debut, {
      className: "chapter-media chapter-media--debut media-figure--wide",
      loading: "lazy",
    })}
    <div class="fact-stack">
      ${renderFact(FACTS_BY_ID["debut-song"])}
      ${renderFact(FACTS_BY_ID["creative-roles"])}
    </div>
    <div class="role-board" aria-label="一般歌曲工作的編輯示意">
      <p class="sr-only">以下是編輯整理的一般工作示意，不是對 i-dle 每首作品的完整 credit 判定。</p>
      ${roles.map(([name, description]) => `<article><span>${escapeHtml(name)}</span><p>${escapeHtml(description)}</p></article>`).join("")}
    </div>`;
}

function renderTurningPoint() {
  const literacy = [
    ["有人提出說法", "有人描述一件事，但內容仍需查證。"],
    ["通用框架：公司否認", "這是媒體識讀中的一般標籤，不是本站對 Soojin 個案新增的事實判定；否認本身也不是法院判決。"],
    ["官方宣布離團", "可確認的團體結果與日期。"],
    ["正式調查或判決", "只有取得正式資料，才能使用相應的定論式語言。"],
  ];
  select("[data-turning-content]").innerHTML = `
    ${renderFact(FACTS_BY_ID["five-members"])}
    <div class="literacy-grid">${literacy
      .map(([term, meaning], index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(term)}</h3><p>${escapeHtml(meaning)}</p></article>`)
      .join("")}</div>
    <aside class="callout"><strong>編輯選擇</strong><p>本站不重述相關指控，也不把任何一方的說法寫成已被正式證明的事實。</p></aside>`;
}

function renderRestart() {
  const root = select("[data-restart-content]");
  root.innerHTML = `
    <div class="restart-facts">
      ${renderFact(FACTS_BY_ID.hiatus)}
      ${renderFact(FACTS_BY_ID["hiatus-activities"])}
      ${renderFact(FACTS_BY_ID["debut-again"])}
      ${renderFact(FACTS_BY_ID["tomboy-message"])}
    </div>
    <div class="strategy-slider">
      <label for="restart-range">危機後，你會把創作策略放在哪裡？</label>
      <div class="strategy-slider__ends"><span>維持原本風格</span><span>完全重新開始</span></div>
      <input id="restart-range" type="range" min="0" max="4" step="1" value="2" />
      <output for="restart-range" data-restart-output>${escapeHtml(RESTART_STRATEGIES[2])}</output>
      <p>這是編輯設計的反思互動，不是對團體內部決策的還原。</p>
    </div>`;
  const range = select("#restart-range", root);
  const output = select("[data-restart-output]", root);
  range.addEventListener("input", () => {
    output.textContent = RESTART_STRATEGIES[Number(range.value)];
  });
}

// Editor-drawn plates. Official album artwork is copyrighted, so nothing here reproduces it.
const PLATE_MOTIFS = {
  slash: `
    <path d="M0 78 L120 26 L120 52 L0 104 Z" fill="var(--plate-edge)" opacity="0.55" />
    <path d="M0 92 L120 40 L120 48 L0 100 Z" fill="var(--plate-accent)" opacity="0.85" />
    <circle cx="97" cy="24" r="13" fill="none" stroke="var(--plate-accent)" stroke-width="2" opacity="0.6" />`,
  frame: `
    <ellipse cx="60" cy="62" rx="34" ry="42" fill="none" stroke="var(--plate-accent)" stroke-width="2" opacity="0.7" />
    <ellipse cx="60" cy="62" rx="27" ry="35" fill="var(--plate-edge)" opacity="0.35" />
    <path d="M60 4 L66 22 L84 16 L74 32 L92 38 L74 44 L84 60 L66 54 L60 72 L54 54 L36 60 L46 44 L28 38 L46 32 L36 16 L54 22 Z" fill="var(--plate-accent)" opacity="0.18" />`,
  card: `
    <rect x="20" y="16" width="52" height="80" rx="7" fill="var(--plate-edge)" opacity="0.5" />
    <rect x="34" y="26" width="52" height="80" rx="7" fill="none" stroke="var(--plate-accent)" stroke-width="2" opacity="0.8" />
    <path d="M60 46 L70 62 L60 78 L50 62 Z" fill="var(--plate-accent)" opacity="0.7" />`,
};

function renderSongPlate(song) {
  const art = song.art ?? {};
  const motif = PLATE_MOTIFS[art.motif] ?? "";
  const style = `--plate-base: ${escapeHtml(art.base ?? "#3a2038")}; --plate-accent: ${escapeHtml(art.accent ?? "#ffd36a")}; --plate-edge: ${escapeHtml(art.edge ?? "#160a16")}`;
  return `
    <div class="credit-card__plate" style="${style}">
      <svg class="credit-card__art" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${motif}</svg>
      <p class="credit-card__year">${song.year}</p>
      <h3>〈${escapeHtml(song.title)}〉</h3>
    </div>`;
}

function renderCredits() {
  select("[data-credits]").innerHTML = SONG_CREDITS.map(
    (song) => `
    <article class="credit-card">
      ${renderSongPlate(song)}
      <div class="credit-card__body">
        <div class="credit-card__header"><span>正式 credit</span>${renderSourceBadges(song.sourceIds)}</div>
        <dl>${Object.entries(song.roles)
          .map(
            ([role, names]) => `<div><dt>${escapeHtml(CREDIT_ROLE_LABELS[role])}</dt><dd>${names.map(escapeHtml).join(" · ")}</dd></div>`,
          )
          .join("")}</dl>
        <p class="credit-card__art-note">卡面圖案由本站繪製，不是官方專輯封面，也不代表官方視覺。</p>
      </div>
    </article>`,
  ).join("");

  select("[data-studio-note]").innerHTML = `
    ${renderFact(FACTS_BY_ID["member-creators"])}
    <aside class="callout callout--purple"><strong>讀 credit 的重點</strong><p>「self-producing」可以表示成員持續參與部分歌曲的詞曲或製作，但不等於所有歌曲都由成員單獨完成。</p>${renderSourceBadges(["S12", "S13", "S14", "S15"])}</aside>`;
}

function renderBusiness() {
  const incomeTypes = [
    ["錄製音樂與串流", "先問收入屬於錄音版本還是其他權利，再看平台如何把款項分配給權利人。", ["S19", "S20"]],
    ["實體銷售", "實體產品屬於錄製音樂市場的一部分；市場整體資料不能直接換算成團體或成員所得。", ["S20"]],
    ["詞曲權利", "作詞、作曲與錄音版本不是同一組權利，可能經過出版商或集管組織等不同路徑。", ["S19"]],
    ["公開演出", "歌曲在不同公開情境被使用時，要先辨認由哪一類權利人與集管機制處理。", ["S19"]],
    ["授權使用", "歌曲被其他作品或服務使用時，仍要回到實際權利人與授權條件，不能用單一公式推算。", ["S19"]],
    ["個別合約", "最終由誰取得多少金額，會受到唱片公司、發行商、出版商、集管組織與個別合約影響。", ["S19"]],
  ];
  select("[data-business-content]").innerHTML = `
    <div class="income-map" aria-label="一般音樂收入機制示意">
      <p class="sr-only">以下是依 S19、S20 整理的基礎分類，不是 i-dle 或任何成員的實際收入判定。</p>
      ${incomeTypes.map(([title, copy, sourceIds]) => `<article><span aria-hidden="true"></span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p>${renderSourceBadges(sourceIds)}</article>`).join("")}
    </div>
    <div class="business-facts">
      ${renderFact(FACTS_BY_ID.streamshare)}
      ${renderFact(FACTS_BY_ID["royalty-path"])}
      ${renderFact(FACTS_BY_ID["global-streaming"])}
    </div>
    <aside class="formula-warning"><span aria-hidden="true">≠</span><div><strong>錯誤公式</strong><p>播放次數 × 固定單價 = 某位成員收入</p><small>公開資料不足以知道個別合約、權利持有與實際分配。</small></div></aside>`;
}

function renderRenewal() {
  select("[data-renewal-content]").innerHTML = `
    ${renderMedia(MEDIA_BY_PLACEMENT.renewal, {
      className: "chapter-media chapter-media--renewal media-figure--wide",
      loading: "lazy",
    })}
    <div class="renewal-grid">
      <article class="renewal-card"><span>2024.11.30</span><h3>一起續約</h3>${renderFact(FACTS_BY_ID.renewal, { compact: true })}</article>
      <article class="renewal-card renewal-card--new"><span>2025.05.02</span><h3>成為 i-dle</h3>${renderFact(FACTS_BY_ID.rename, { compact: true })}${renderFact(FACTS_BY_ID["rename-meaning"], { compact: true })}</article>
    </div>
    <blockquote class="chapter-question">改變名字是在否定過去，還是保留過去並重新決定未來？</blockquote>`;
}

function renderTakeaways() {
  select("[data-takeaways]").innerHTML = `<ol class="takeaway-list">${TAKEAWAYS.map((item, index) => `<li><span>0${index + 1}</span><p>${escapeHtml(item)}</p></li>`).join("")}</ol>`;
}

// Which chapters actually cite a source is derived from the badges already on the
// page, so the register cannot drift from the article the way a hand-kept list would.
function buildChapterIndex() {
  const chapterById = new Map(CHAPTERS.map((chapter) => [chapter.id, chapter]));
  const index = new Map();
  for (const badge of document.querySelectorAll(".source-badge")) {
    const section = badge.closest("[data-chapter]");
    if (!section || section.id === "sources") continue;
    const chapter = chapterById.get(section.id);
    if (!chapter) continue;
    const id = badge.textContent.trim();
    if (!index.has(id)) index.set(id, new Map());
    index.get(id).set(chapter.id, chapter);
  }
  return new Map([...index].map(([id, chapters]) => [id, [...chapters.values()]]));
}

function renderMediaGroup() {
  const activeSources = MEDIA_SOURCES.filter((source) => source.status === "active");
  const retiredSources = MEDIA_SOURCES.filter((source) => source.status === "retired");
  const distinctPhotos = new Set(ACTIVE_MEDIA.map((media) => media.photoId)).size;
  return renderSourceGroup({
    icon: "📷",
    label: "圖片授權",
    hint: `本站載入 ${ACTIVE_MEDIA.length} 張圖片，來自 ${distinctPhotos} 張不同原始照片與 ${activeSources.length} 筆 active 授權來源；另保留 ${retiredSources.length} 筆已退役來源的 provenance。`,
    count: MEDIA_SOURCES.length,
    body: `
      <p class="media-register-heading__rights"><strong>權利範圍（適用於以下全部來源）：</strong>${escapeHtml(RIGHTS_NOTICE)}</p>
      ${MEDIA_SOURCES.map((source) => renderMediaLicenseCard(source, MEDIA)).join("")}`,
  });
}

function renderSources() {
  select("[data-source-method]").innerHTML = `
    <div class="method-grid">
      <article><span>A</span><h3>第一手</h3><p>官方公告、官方 credit、成員本人完整訪談、正式 booklet。</p></article>
      <article><span>B</span><h3>高可信媒體</h3><p>具編輯責任的通訊社、新聞媒體與產業機構。</p></article>
      <article><span>C</span><h3>可用但需標限制</h3><p>二手引述或人物整理，要區分原話與媒體詮釋。</p></article>
      <article><span>×</span><h3>不採用</h3><p>無來源 wiki、匿名爆料、身價網站、家庭傳聞與未公開合約推測。</p></article>
    </div>
    <p class="method-note">來源標籤會帶你回到下方對應的分類；分類會自動展開。可信度是工作方法，不是替讀者停止思考。</p>`;

  select("[data-source-list]").innerHTML = renderSourceLibrary({
    tiers: groupSourcesByTier(SOURCE_LIST),
    chapterIndex: buildChapterIndex(),
    accessed: SOURCE_LIST[0]?.accessed,
    mediaGroup: renderMediaGroup(),
    mediaCount: MEDIA_SOURCES.length,
  });

  const toggle = select("[data-action='toggle-all-sources']");
  const groups = [...document.querySelectorAll(".source-library .source-group")];
  toggle?.addEventListener("click", () => {
    const expand = toggle.getAttribute("aria-expanded") !== "true";
    groups.forEach((group) => { group.open = expand; });
    toggle.setAttribute("aria-expanded", String(expand));
    toggle.textContent = expand ? "全部收合" : "全部展開";
  });
}

function setupChapterObserver() {
  const links = new Map([...document.querySelectorAll("[data-nav-link]")].map((link) => [link.dataset.navLink, link]));
  const sections = [...document.querySelectorAll("[data-chapter]")];
  if (!sections.length || !links.size) return;
  const markCurrent = (id) => links.forEach((link, linkId) => {
    if (linkId === id) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  if (typeof globalThis.IntersectionObserver === "function") {
    const observer = new globalThis.IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) markCurrent(visible.target.id);
      },
      { rootMargin: "-20% 0px -65%", threshold: [0.05, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return;
  }
  const update = () => {
    const marker = window.innerHeight * 0.3;
    const current = sections.reduce((selected, section) => {
      if (section.getBoundingClientRect().top <= marker) return section;
      return selected;
    }, sections[0]);
    markCurrent(current.id);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function setupReadingProgress() {
  const bar = select("[data-reading-progress]");
  if (!bar) return;
  let ticking = false;
  const schedule = typeof globalThis.requestAnimationFrame === "function"
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      schedule(update);
    },
    { passive: true },
  );
  update();
}

function setupSourceFocus() {
  // Opening the ancestor accordions before the browser handles the fragment keeps
  // the default anchor scroll, history entry, and :target highlight intact.
  const reveal = (target) => {
    for (let node = target.parentElement; node; node = node.parentElement) {
      if (node instanceof HTMLDetailsElement) node.open = true;
    }
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#source-"], a[href^="#media-license-"]');
    if (!link) return;
    const target = select(link.getAttribute("href"));
    if (!target) return;
    reveal(target);
    window.setTimeout(() => target.focus({ preventScroll: true }), 350);
  });

  const revealFromHash = () => {
    if (!/^#(?:source|media-license)-/.test(window.location.hash)) return;
    const target = select(window.location.hash);
    if (!target) return;
    reveal(target);
    target.scrollIntoView();
    target.focus({ preventScroll: true });
  };
  window.addEventListener("hashchange", revealFromHash);
  revealFromHash();
}

function initialize() {
  document.documentElement.classList.add("js");
  renderNavigation();
  renderHeroMedia();
  renderQuickFacts();
  renderTimeline();
  renderMembers();
  renderTraineeScenario();
  renderDebut();
  renderTurningPoint();
  renderRestart();
  renderCredits();
  renderBusiness();
  renderRenewal();
  renderTakeaways();
  renderSources();
  initGame(select("[data-game-app]"));
  setupChapterObserver();
  setupReadingProgress();
  setupSourceFocus();
  initCounter("idle-creator-journey");

  const status = document.createElement("p");
  status.className = "sr-only";
  status.setAttribute("aria-live", "polite");
  document.body.append(status);
  window.addEventListener("hashchange", () => {
    const chapter = CHAPTERS.find((item) => `#${item.id}` === window.location.hash);
    if (chapter) setLiveMessage(status, `已前往第 ${chapter.number} 章：${chapter.label}`);
  });

  document.documentElement.dataset.updated = SITE_META.updatedAt;
}

try {
  initialize();
} catch {
  const fallback = document.createElement("p");
  fallback.setAttribute("role", "alert");
  fallback.textContent = "頁面互動暫時無法載入；你仍可閱讀已載入的內容，請重新整理後再試。";
  document.body.prepend(fallback);
}
