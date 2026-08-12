import { SOURCES_BY_ID } from "./data/sources.mjs";

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderMediaAttribution(media, { compact = false } = {}) {
  const source = media.source ?? media;
  return `
    <figcaption class="media-credit${compact ? " media-credit--compact" : ""}">
      ${media.caption ? `<span class="media-credit__caption">${escapeHtml(media.caption)}</span>` : ""}
      <span><a href="#media-license-${escapeHtml(source.id)}" aria-label="查看圖片授權 ${escapeHtml(source.id)}">${escapeHtml(source.id)}</a></span>
      <span><a href="${escapeHtml(source.filePageUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.author)}</a></span>
      <span><a href="${escapeHtml(source.licenseUrl)}" target="_blank" rel="license noopener noreferrer">${escapeHtml(source.licenseName)}</a></span>
    </figcaption>`;
}

export function renderMedia(media, { className = "", loading = "lazy", priority = false, compactCredit = false, frameClass = "" } = {}) {
  if (!media) return "";
  const placements = media.placements?.join(" ") ?? "";
  const styles = [
    media.focalPosition ? `object-position: ${media.focalPosition}` : "",
    media.avatarZoom ? `--avatar-zoom: ${media.avatarZoom}` : "",
  ].filter(Boolean);
  const style = styles.length ? ` style="${escapeHtml(styles.join("; "))}"` : "";
  const image = `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt)}" width="${media.width}" height="${media.height}" loading="${escapeHtml(loading)}" decoding="async"${priority ? ' fetchpriority="high"' : ""}${style} />`;
  return `
    <figure class="media-figure ${escapeHtml(className)}" data-media-id="${escapeHtml(media.id)}" data-photo-id="${escapeHtml(media.photoId)}" data-media-placement="${escapeHtml(placements)}">
      ${frameClass ? `<div class="${escapeHtml(frameClass)}">${image}</div>` : image}
      ${renderMediaAttribution(media, { compact: compactCredit })}
    </figure>`;
}

export function renderMemberMediaFallback(member) {
  return `
    <div class="member-card__media member-card__media--fallback">
      <div class="member-card__avatar member-card__avatar--blank" role="img" aria-label="${escapeHtml(member.name)} 姓名縮寫卡；目前沒有放入通過授權與畫面篩選的近期單人照片">
        <span aria-hidden="true">${escapeHtml(member.name.slice(0, 1))}</span>
      </div>
      <p class="member-card__avatar-note">目前沒有通過授權與畫面篩選的近期單人照片；保留空白，比使用授權或畫面不合適的照片更重要。</p>
    </div>`;
}

// The attribution a reader needs (author, licence, file page) stays visible; the
// audit trail (review evidence, hash, crop notes) collapses so eight licence
// entries do not outweigh the chapter they belong to.
export function renderMediaLicenseCard(source, media = []) {
  const activeDerivatives = media.filter((item) => item.status === "active" && item.sourceId === source.id);
  return `
    <article class="media-license-card" id="media-license-${escapeHtml(source.id)}">
      <div class="media-license-card__head">
        <p class="media-license-card__eyebrow">圖片授權 ${escapeHtml(source.id)}${source.status === "retired" ? "／已退役" : ""}</p>
        <h3>${escapeHtml(source.title)}</h3>
      </div>
      <dl>
        <div><dt>作者</dt><dd>${escapeHtml(source.author)}</dd></div>
        <div><dt>拍攝日期</dt><dd>${escapeHtml(source.capturedAt)}</dd></div>
        <div><dt>授權</dt><dd><a href="${escapeHtml(source.licenseUrl)}" target="_blank" rel="license noopener noreferrer">${escapeHtml(source.licenseName)}</a></dd></div>
        <div><dt>檔案頁</dt><dd><a href="${escapeHtml(source.filePageUrl)}" target="_blank" rel="noopener noreferrer">Wikimedia Commons<span aria-hidden="true"> ↗</span></a></dd></div>
      </dl>
      <p class="media-license-card__usage">${
        source.usageNote
          ? escapeHtml(source.usageNote)
          : activeDerivatives.length
            ? `本站使用 ${activeDerivatives.length} 個本地衍生檔。`
            : "此來源目前不在公開版面載入。"
      }</p>
      <details class="media-license-card__audit">
        <summary>核對紀錄與技術資料<span class="sr-only">（${escapeHtml(source.id)}）</span></summary>
        <dl>
          <div><dt>查閱日期</dt><dd>${escapeHtml(source.accessedAt ?? "未記錄")}</dd></div>
          <div><dt>核對日期</dt><dd>${escapeHtml(source.reviewedAt ?? "未記錄")}</dd></div>
          <div><dt>授權核對</dt><dd>${escapeHtml(source.reviewEvidence)}</dd></div>
          ${activeDerivatives.length ? `<div><dt>使用位置</dt><dd>${activeDerivatives.flatMap((item) => item.placements ?? []).map(escapeHtml).join("；")}</dd></div>` : ""}
          ${activeDerivatives.length ? `<div><dt>修改</dt><dd>${activeDerivatives.map((item) => escapeHtml(item.modified)).join("；")}</dd></div>` : ""}
          ${activeDerivatives.length ? `<div><dt>衍生檔雜湊</dt><dd>${activeDerivatives.map((item) => `<code>${escapeHtml(item.sha256)}</code>`).join("<br />")}</dd></div>` : ""}
          <div><dt>原始檔</dt><dd><a href="${escapeHtml(source.originalUrl)}" target="_blank" rel="noopener noreferrer">開啟原始圖片<span aria-hidden="true"> ↗</span></a></dd></div>
          <div><dt>原檔雜湊</dt><dd><code>${escapeHtml(source.originalSha256)}</code></dd></div>
        </dl>
      </details>
    </article>`;
}

export function renderSourceBadges(sourceIds = []) {
  if (!sourceIds.length) return "";

  return `<span class="source-badges" aria-label="資料來源">${sourceIds
    .map((id) => {
      const source = SOURCES_BY_ID[id];
      const label = source ? `${id}：${source.publisher}` : `資料來源 ${id}`;
      return `<a class="source-badge" href="#source-${escapeHtml(id)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${escapeHtml(id)}</a>`;
    })
    .join("")}</span>`;
}

export function renderFact(fact, { compact = false, treatment = compact ? "flat" : "card", showCaveat = false } = {}) {
  return `
    <article class="fact-card${compact ? " fact-card--compact" : ""}" data-authored-unit data-treatment="${escapeHtml(treatment)}">
      <div class="fact-card__meta">${renderSourceBadges(fact.sourceIds)}</div>
      <p>${escapeHtml(fact.text)}</p>
      ${showCaveat && fact.caveat ? `<details class="fact-card__note"><summary>補充說明</summary><p>${escapeHtml(fact.caveat)}</p></details>` : ""}
    </article>`;
}

export function renderSectionSources(sourceIds = []) {
  return `<div class="inline-sources"><span>對應來源</span>${renderSourceBadges(sourceIds)}</div>`;
}

// Narrative renderers for the content-expansion pass. Source traceability lives
// in a small badge row that does not outweigh the paragraph it accompanies; pure
// editorial reflections carry no badges so they cannot be mistaken for quotes.
export function renderNarrativeParagraphs(units = [], { treatment = "flat" } = {}) {
  return units
    .map((unit) => {
      const badges = unit.sourceIds?.length ? renderSourceBadges(unit.sourceIds) : "";
      return `<p class="narrative-paragraph" data-authored-unit data-treatment="${escapeHtml(treatment)}">${escapeHtml(unit.text)}${badges ? `<span class="narrative-paragraph__sources">${badges}</span>` : ""}</p>`;
    })
    .join("");
}

export function renderStoryBlock(narrative) {
  if (!narrative) return "";
  const story = narrative.story ? renderNarrativeParagraphs(narrative.story) : "";
  const explanation = narrative.explanation ? renderNarrativeParagraphs(narrative.explanation) : "";
  return `<div class="story-block">${story}${explanation ? `<div class="story-block__explanation">${explanation}</div>` : ""}</div>`;
}

export function renderReflectionPrompt(narrative) {
  if (!narrative?.reflection?.text) return "";
  return `<aside class="reflection-prompt" data-authored-unit data-treatment="card"><p><span class="reflection-prompt__mark" aria-hidden="true">？</span>${escapeHtml(narrative.reflection.text)}</p></aside>`;
}

export function renderMetricMeter(key, label, value) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const labelId = `${key}-metric-label`;
  return `
    <div class="metric" data-metric="${escapeHtml(key)}">
      <div class="metric__label"><span id="${escapeHtml(labelId)}">${escapeHtml(label)}</span><strong>${safeValue}</strong></div>
      <div class="metric__track" aria-hidden="true"><span style="--meter-value: ${safeValue}%"></span></div>
      <meter class="sr-only" id="${escapeHtml(key)}-metric" aria-labelledby="${escapeHtml(labelId)}" min="0" max="100" value="${safeValue}">${safeValue} / 100</meter>
    </div>`;
}

// Chapter 13 is a register, not an essay: every source is grouped by credibility
// tier inside a collapsed accordion, and each entry names the chapters it backs.
export function renderSourceEntry(source, chapters = []) {
  const searchText = [source.id, source.title, source.publisher, source.credibility, source.supports, source.limitations].join(" ").toLocaleLowerCase("zh-Hant-TW");
  return `
    <article class="source-entry" id="source-${escapeHtml(source.id)}" tabindex="-1" data-source-entry data-source-search="${escapeHtml(searchText)}">
      <span class="source-entry__id">${escapeHtml(source.id)}</span>
      <div class="source-entry__main">
        <p class="source-entry__title">
          <a class="text-link" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}<span aria-hidden="true"> ↗</span></a>
        </p>
        <p class="source-entry__meta">${escapeHtml(source.publisher)}${source.date ? ` · <time datetime="${escapeHtml(source.date)}">${escapeHtml(source.date)}</time>` : ""} · ${escapeHtml(source.credibility)}</p>
        ${chapters.length
          ? `<p class="source-entry__chapters">對應內容：${chapters.map((chapter) => `<a href="#${escapeHtml(chapter.id)}">${escapeHtml(chapter.number)} ${escapeHtml(chapter.label)}</a>`).join("")}</p>`
          : ""}
        <p class="source-entry__note"><strong>可支持</strong>${escapeHtml(source.supports)}</p>
        <p class="source-entry__note"><strong>限制</strong>${escapeHtml(source.limitations)}</p>
      </div>
    </article>`;
}

export function renderSourceGroup({ icon, label, hint, count, body }) {
  return `
    <details class="source-group">
      <summary class="source-group__summary">
        <span class="source-group__label"><span aria-hidden="true">${icon}</span>${escapeHtml(label)}</span>
        <span class="source-group__count">${count} 筆</span>
      </summary>
      <div class="source-group__body">
        ${hint ? `<p class="source-group__hint">${escapeHtml(hint)}</p>` : ""}
        ${body}
      </div>
    </details>`;
}

export function renderSourceLibrary({ tiers, chapterIndex, accessed = "", mediaGroup = "", mediaCount = 0 }) {
  const total = tiers.reduce((sum, tier) => sum + tier.sources.length, 0);
  return `
    <div class="source-library">
      <div class="source-library__bar">
        <p class="source-library__intro">
          共 ${total} 筆文字來源（依可信度分成 ${tiers.length} 組）${mediaCount ? ` 與 ${mediaCount} 筆圖片授權` : ""}。${accessed ? `文字來源查閱日期均為 <time datetime="${escapeHtml(accessed)}">${escapeHtml(accessed)}</time>。` : ""}
        </p>
        <label class="source-library__filter">搜尋文字來源
          <input type="search" data-source-filter placeholder="輸入 S ID、發布者或關鍵字" autocomplete="off" />
        </label>
        <button class="button button--ghost" type="button" data-action="toggle-all-sources" aria-expanded="false">全部展開</button>
      </div>
      <p class="source-library__filter-status" data-source-filter-status aria-live="polite"></p>
      ${tiers
        .map((tier) =>
          renderSourceGroup({
            icon: tier.icon,
            label: tier.label,
            hint: tier.hint,
            count: tier.sources.length,
            body: tier.sources.map((source) => renderSourceEntry(source, chapterIndex.get(source.id) ?? [])).join(""),
          }))
        .join("")}
      ${mediaGroup}
    </div>`;
}

export function setLiveMessage(element, message) {
  if (!element) return;
  element.textContent = "";
  const schedule = typeof globalThis.requestAnimationFrame === "function"
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  schedule(() => {
    element.textContent = message;
  });
}
