import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import { SONG_CREDITS } from "../src/data/credits.mjs";
import { FACTS, FACTS_BY_ID } from "../src/data/facts.mjs";
import { GAME_CONFIG, GAME_EVENTS, GAME_THEMES, PRODUCTION_CHOICES } from "../src/data/game.mjs";
import { ACTIVE_MEDIA, MEDIA, MEDIA_BY_ID, MEDIA_BY_PLACEMENT, MEDIA_SOURCE_BY_ID, MEDIA_SOURCES } from "../src/data/media.mjs";
import { MEMBERS } from "../src/data/members.mjs";
import { CHAPTER_NARRATIVES, MEMBER_NARRATIVES } from "../src/data/narrative.mjs";
import { CHAPTERS, PHASES, SITE_META, TAKEAWAYS, TRAINEE_SCENARIO } from "../src/data/site.mjs";
import { SOURCE_LIST, SOURCES_BY_ID } from "../src/data/sources.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const html = read("index.html");
const mainScript = read("src/main.mjs");
const gameView = read("src/game/view.mjs");
const sourceRegister = read("docs/SOURCE_REGISTER.md");
const sourceIdsInRegister = new Set([...sourceRegister.matchAll(/^## (S\d+[A-Z]?)｜/gm)].map((match) => match[1]));
const allKnownSourceIds = new Set(SOURCE_LIST.map((source) => source.id));

function referencedSourceIds(value) {
  return value?.sourceIds ?? [];
}

function collectDataSourceIds() {
  const values = [
    ...FACTS,
    ...MEMBERS,
    ...SONG_CREDITS,
    ...GAME_THEMES,
    ...PRODUCTION_CHOICES,
    TRAINEE_SCENARIO,
  ];
  return values.flatMap(referencedSourceIds);
}

test("confirmed page metadata and all 13 chapter routes stay synchronized", () => {
  assert.match(html, new RegExp(`<title>${SITE_META.title}</title>`));
  assert.match(html, new RegExp(`<h1[^>]*>${SITE_META.h1}</h1>`));
  assert.match(html, new RegExp(`name="description"\\s+content="${SITE_META.description.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}"`));
  assert.match(html, /lang="zh-Hant-TW"/);

  const sectionIds = [...html.matchAll(/<section\s+id="([^"]+)"[^>]*data-chapter=/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, CHAPTERS.map((chapter) => chapter.id));
  assert.equal(new Set(sectionIds).size, CHAPTERS.length);
  for (const chapter of CHAPTERS) {
    assert.match(html, new RegExp(`<section[^>]*id="${chapter.id}"[^>]*aria-labelledby="[^"]+"`));
    assert.match(html, new RegExp(`<section[^>]*id="${chapter.id}"[^>]*data-scene="${chapter.sceneId}"`));
    assert.ok(PHASES.some((phase) => phase.id === chapter.phaseId));
  }
  assert.equal(new Set(PHASES.map((phase) => phase.id)).size, PHASES.length);
  assert.ok(PHASES.every((phase) => CHAPTERS.some((chapter) => chapter.phaseId === phase.id)));
  assert.ok(CHAPTERS.slice(0, 12).every((chapter) => chapter.resumeEligible));
  assert.equal(CHAPTERS.at(-1).resumeEligible, false);
  assert.match(html, /先走完整故事/);
  assert.match(html, /我已了解背景，直接玩/);
  assert.match(html, /故事路線約 10 分鐘/);
  assert.match(html, /約 4–6 分鐘/);

  const linkedStylesheets = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(linkedStylesheets, ["css/tokens.css", "css/base.css", "css/layout.css", "css/components.css", "css/game.css"]);
  for (const href of linkedStylesheets) assert.ok(fs.existsSync(path.join(ROOT, href)), `missing stylesheet: ${href}`);
});

test("source register and every content data reference have no dangling IDs", () => {
  assert.equal(allKnownSourceIds.size, SOURCE_LIST.length);
  assert.deepEqual([...allKnownSourceIds].sort(), [...sourceIdsInRegister].sort());

  const references = collectDataSourceIds();
  for (const sourceId of references) {
    assert.ok(allKnownSourceIds.has(sourceId), `unknown source ID in data: ${sourceId}`);
    assert.ok(sourceIdsInRegister.has(sourceId), `source ID missing from register: ${sourceId}`);
    const source = SOURCES_BY_ID[sourceId];
    assert.match(source.url, /^https:\/\//, `${sourceId} must use HTTPS`);
    assert.ok(source.publisher && source.supports && source.limitations, `${sourceId} is incomplete`);
  }

});

test("licensed media assets are local, traceable, distinct, and placement-driven", () => {
  const activeSources = MEDIA_SOURCES.filter((source) => source.status === "active");
  const retiredSources = MEDIA_SOURCES.filter((source) => source.status === "retired");
  assert.ok(ACTIVE_MEDIA.length >= 6);
  assert.ok(activeSources.length >= 6);
  assert.ok(retiredSources.some((source) => source.id === "M01"));
  assert.equal(new Set(ACTIVE_MEDIA.map((media) => media.photoId)).size, ACTIVE_MEDIA.length, "active visual slots must use different original photos");
  assert.equal(MEDIA_BY_PLACEMENT.hero?.id, "idle-mma-2024");
  assert.equal(MEDIA_BY_PLACEMENT.debut?.id, "idle-debut-2018");
  assert.equal(MEDIA_BY_PLACEMENT.renewal?.id, "idle-tacoma-2024");
  assert.equal(MEDIA_BY_PLACEMENT["member:shuhua"]?.id, "shuhua-amsterdam-2023");
  assert.deepEqual(
    MEMBERS.map((member) => MEDIA_BY_ID[member.mediaId]?.source.author),
    Array(5).fill("Robbie Klinkenberg"),
    "all five member portraits should come from the same photographer and concert series",
  );
  assert.equal(new Set(MEMBERS.map((member) => MEDIA_BY_ID[member.mediaId]?.source.capturedAt)).size, 1);
  assert.ok(MEMBERS.every((member) => member.sourceIds.every((id) => allKnownSourceIds.has(id))));

  for (const source of MEDIA_SOURCES) {
    assert.match(source.filePageUrl, /^https:\/\/commons\.wikimedia\.org\//);
    assert.match(source.originalUrl, /^https:\/\/upload\.wikimedia\.org\//);
    assert.match(source.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\/by(?:-sa)?\/\d\.0\//);
    assert.ok(source.author && source.creditText && source.reviewEvidence && source.accessedAt && source.rightsNotice);
    assert.equal(source.reviewStatus, "approved");
    const originalPath = path.join(ROOT, source.originalAsset);
    assert.ok(fs.existsSync(originalPath), `missing original media asset: ${source.originalAsset}`);
    assert.equal(createHash("sha256").update(fs.readFileSync(originalPath)).digest("hex"), source.originalSha256);
  }

  for (const media of MEDIA) {
    assert.doesNotMatch(media.src, /^https?:/);
    assert.ok(MEDIA_SOURCE_BY_ID[media.sourceId], `unknown media source: ${media.sourceId}`);
    const assetPath = path.join(ROOT, media.src);
    assert.ok(fs.existsSync(assetPath), `missing media asset: ${media.src}`);
    assert.equal(createHash("sha256").update(fs.readFileSync(assetPath)).digest("hex"), media.sha256);
    assert.ok(media.width > 0 && media.height > 0 && media.alt && media.caption && media.modified);
    if (media.status === "active") {
      assert.equal(media.reviewStatus, "approved");
      assert.equal(media.source.status, "active");
      assert.ok(media.placements.length > 0);
    } else {
      assert.deepEqual(media.placements, []);
    }
  }

  for (const member of MEMBERS) {
    assert.ok(member.mediaId, `${member.id} must have a reviewed member portrait`);
    assert.equal(MEDIA_BY_ID[member.mediaId]?.memberId, member.id);
    assert.equal(MEDIA_BY_ID[member.mediaId]?.status, "active");
    assert.match(MEDIA_BY_ID[member.mediaId]?.modified, /補黑/);
  }

  const register = read("docs/MEDIA_REGISTER.md");
  for (const source of MEDIA_SOURCES) assert.match(register, new RegExp(`(?:### |## )${source.id}｜`));
  assert.match(register, /M01｜[^\n]+已退役/);
  assert.match(register, /2018-05-02/);
});

test("the core historical facts and naming rules remain conservative", () => {
  assert.match(FACTS_BY_ID.debut.text, /2018 年 5 月 2 日/);
  assert.match(FACTS_BY_ID.debut.text, /六人/);
  assert.match(FACTS_BY_ID["five-members"].text, /2021 年 8 月 14 日/);
  assert.match(FACTS_BY_ID["five-members"].text, /五人/);
  assert.match(FACTS_BY_ID.hiatus.text, /2022 年 3 月 14 日/);
  assert.match(FACTS_BY_ID.hiatus.text, /I NEVER DIE/);
  assert.match(FACTS_BY_ID.renewal.text, /2024 年 11 月 30 日/);
  assert.match(FACTS_BY_ID.rename.text, /2025 年 5 月 2 日/);
  assert.match(FACTS_BY_ID.rename.text, /小寫 i-dle/);
  assert.equal(SITE_META.firstMention, "i-dle（原名 (G)I-DLE）");
  assert.match(html, /i-dle（原名 \(G\)I-DLE）/);
  assert.match(html, /i-dle \/ create/);
  assert.doesNotMatch(html, />idle \/ create</);
  assert.match(mainScript, /FACTS_BY_ID\["original-members"\]/);
  assert.match(mainScript, /FACTS_BY_ID\["current-members"\]/);

  const content = [html, ...FACTS.map((fact) => fact.text), ...MEMBERS.flatMap((member) => [member.start, member.challenge, member.ability])].join("\n");
  assert.doesNotMatch(content, /(?:身價|年薪|月薪|續約金\s*\d|固定每次播放單價\s*=\s*[^。]*收入)/);
  assert.doesNotMatch(content, /Soojin[^\n]{0,100}(?:確定|證實|判決|有罪)/i);
  assert.doesNotMatch(content, /Shuhua[^\n]{0,100}(?:精確|確定)練習生年限/);
});

test("member cards, credits, and learning content preserve required coverage", () => {
  assert.deepEqual(MEMBERS.map((member) => member.id), ["miyeon", "minnie", "soyeon", "yuqi", "shuhua"]);
  assert.equal(MEMBERS.length, 5);
  assert.equal(FACTS.length > 0, true);
  assert.equal(TAKEAWAYS.length, 5);
  assert.equal(TRAINEE_SCENARIO.choices.length, 4);
  assert.match(MEMBERS.find((member) => member.id === "minnie").ability, /五歲.*鋼琴/);
  assert.match(MEMBERS.find((member) => member.id === "yuqi").challenge, /HyunA/);
  assert.match(MEMBERS.find((member) => member.id === "shuhua").start, /台灣/);
  for (const concept of ["實體銷售", "公開演出", "授權使用"]) assert.match(mainScript, new RegExp(concept));
  assert.deepEqual(SONG_CREDITS.map((song) => song.title), ["TOMBOY", "Nxde", "Queencard"]);

  const expectedCredits = {
    TOMBOY: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "JENCI"],
      arranged: ["Pop Time", "JENCI", "Soyeon"],
    },
    Nxde: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "Kako"],
      arranged: ["Pop Time", "Kako", "Soyeon"],
    },
    Queencard: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "Daily", "Likey"],
      arranged: ["Pop Time", "Daily", "Likey", "Soyeon"],
    },
  };
  for (const song of SONG_CREDITS) assert.deepEqual(song.roles, expectedCredits[song.title]);
  for (const song of SONG_CREDITS) assert.ok(song.sourceIds.every((id) => allKnownSourceIds.has(id)));
});

test("the game data exposes exactly the brief's resources and five metrics", () => {
  assert.deepEqual(GAME_CONFIG.initialResources, { points: 10, energy: 5, weeks: 4 });
  assert.deepEqual(Object.keys(GAME_CONFIG.metricLabels), ["clarity", "music", "reach", "health", "brand"]);
  assert.deepEqual(Object.keys(GAME_CONFIG.metricExplanations), Object.keys(GAME_CONFIG.metricLabels));
  assert.equal(GAME_CONFIG.stepSituations.length, 5);
  assert.deepEqual(Object.keys(GAME_CONFIG.allocationLabels), ["music", "stage", "mv", "promo", "rest"]);
  assert.equal(GAME_THEMES.length, 5);
  assert.equal(PRODUCTION_CHOICES.length, 3);
  assert.equal(GAME_EVENTS.length, 5);
  assert.ok(GAME_EVENTS.every((event) => event.choices.length >= 3));
  assert.match(SITE_META.simulationNotice, /教育模擬/);
  assert.match(SITE_META.simulationNotice, /不使用.*真實預算.*合約.*分潤/);
  assert.match(gameView, /企劃完成：你做了 5 個決定。/);
  assert.match(gameView, /這次的決策傾向/);
  assert.match(gameView, /這不是固定人格或能力測驗/);
  assert.match(gameView, /帶走我的企劃句/);
});

test("all content source references are attached to non-empty, traceable records", () => {
  for (const fact of FACTS) {
    assert.ok(fact.id && fact.text && fact.type, "fact must have identity, text, and type");
    assert.ok(fact.sourceIds.length > 0, `${fact.id} has no sources`);
  }
  for (const member of MEMBERS) {
    assert.ok(member.sourceIds.length > 0, `${member.id} has no sources`);
    assert.ok(member.caveat, `${member.id} must retain a data limitation`);
  }
  for (const event of GAME_EVENTS) {
    assert.ok(event.id && event.title && event.description);
    for (const choice of event.choices) assert.ok(choice.id && choice.label);
  }
});

test("the content-expansion pass removes the hero editor note and adds one centralized editorial rule", () => {
  // Hero must no longer show the editor-defence note to readers.
  assert.doesNotMatch(html, /首頁問題是編輯提問，不是成員名言/);
  assert.doesNotMatch(html, /class="hero__note"/);

  // The centralised editorial boundary lives in chapter 13's method block and is rendered once.
  assert.match(mainScript, /data-editorial-rule/);
  assert.match(mainScript, /未加署名的章節標題、提問與反思句/);
  const ruleMatches = [...mainScript.matchAll(/未加署名的章節標題、提問與反思句/g)];
  assert.equal(ruleMatches.length, 1, "the editorial boundary rule must appear exactly once in source");
});

test("narrative data is source-traceable and editorial reflections are never mistaken for member quotes", () => {
  const narrativeChapterIds = Object.keys(CHAPTER_NARRATIVES);
  // Chapters 2–12 must each carry at least one main narrative unit.
  const expectedNarrativeChapters = CHAPTERS.filter((chapter) => chapter.number >= "02" && chapter.number <= "12").map((chapter) => chapter.id);
  for (const id of expectedNarrativeChapters) {
    assert.ok(narrativeChapterIds.includes(id), `chapter ${id} is missing a narrative entry`);
  }

  for (const narrative of Object.values(CHAPTER_NARRATIVES)) {
    for (const unit of [...(narrative.story ?? []), ...(narrative.explanation ?? [])]) {
      assert.ok(unit.text && unit.text.length > 0, "narrative unit must have text");
      if (unit.editorial === true) {
        assert.ok(!unit.sourceIds || unit.sourceIds.length === 0, "editorial narrative unit must not carry sourceIds");
      } else {
        assert.ok(unit.sourceIds && unit.sourceIds.length > 0, "non-editorial narrative unit must carry sourceIds");
        for (const id of unit.sourceIds) {
          assert.ok(allKnownSourceIds.has(id), `narrative references unknown source ${id}`);
        }
      }
    }
    if (narrative.reflection) {
      // Reflections are editorial prompts — they must never look like attributed member quotes.
      assert.equal(narrative.reflection.editorial, true, "reflection must be flagged editorial");
      assert.ok(!narrative.reflection.sourceIds || narrative.reflection.sourceIds.length === 0, "reflection must not carry sourceIds");
      // Reflections must not be framed as direct attributed speech.
      assert.doesNotMatch(narrative.reflection.text, /成員.*表示|Soyeon.*說[：:]/);
    }
  }

  // Member narrative depth is conservative: no new biographical claim beyond existing sources.
  for (const member of MEMBERS) {
    const memberNarrative = MEMBER_NARRATIVES[member.id];
    assert.ok(memberNarrative, `${member.id} needs a member narrative entry`);
    for (const unit of [...(memberNarrative.story ?? []), ...(memberNarrative.observation ? [memberNarrative.observation] : [])]) {
      if (unit.editorial === true) {
        assert.ok(!unit.sourceIds || unit.sourceIds.length === 0, `${member.id} editorial unit must not carry sourceIds`);
      } else if (unit.sourceIds) {
        for (const id of unit.sourceIds) assert.ok(allKnownSourceIds.has(id), `${member.id} narrative references unknown source ${id}`);
      }
    }
  }
});

test("priority chapters have substantive narrative expansion without filler repetition", () => {
  const priorityChapters = ["paths", "restart", "studio", "music-business"];
  for (const id of priorityChapters) {
    const narrative = CHAPTER_NARRATIVES[id];
    const allText = [...(narrative.story ?? []), ...(narrative.explanation ?? [])].map((unit) => unit.text).join("");
    assert.ok(allText.length >= 120, `priority chapter ${id} should have substantive narrative text (got ${allText.length} chars)`);
    // Each priority chapter should have at least two explanation/understanding units (the 理解層).
    assert.ok((narrative.explanation ?? []).length >= 2, `priority chapter ${id} should have at least 2 explanation units`);
  }
});
