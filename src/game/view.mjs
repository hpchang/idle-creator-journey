import { GAME_CONFIG, GAME_EVENTS, GAME_THEMES, PRODUCTION_CHOICES } from "../data/game.mjs";
import { SITE_META } from "../data/site.mjs";
import { escapeHtml, renderMetricMeter, renderSourceBadges } from "../ui.mjs";
import { computeGameState, getResult, validateAllocation } from "./model.mjs";

function renderChoice(choice, groupName, selectedId) {
  return `
    <div class="game-choice${choice.id === selectedId ? " game-choice--selected" : ""}">
      <label>
        <input type="radio" name="${escapeHtml(groupName)}" value="${escapeHtml(choice.id)}" ${choice.id === selectedId ? "checked" : ""} />
        <span class="game-choice__marker" aria-hidden="true"></span>
        <span><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.description ?? "")}</small></span>
      </label>
      ${choice.sourceIds ? `<div class="game-choice__sources">${renderSourceBadges(choice.sourceIds)}</div>` : ""}
    </div>`;
}

function renderResourceSummary(state) {
  const { resources, metrics } = computeGameState(state);
  return `
    <div class="game-dashboard" role="region" aria-labelledby="game-dashboard-title">
      <h2 id="game-dashboard-title" class="sr-only">目前企劃狀態</h2>
      <div class="resource-row">
        <span><strong>${resources.points}</strong> 企劃點</span>
        <span><strong>${resources.energy}</strong> 團隊能量</span>
        <span><strong>${resources.weeks}</strong> 週</span>
      </div>
      <div class="metric-grid">${Object.entries(GAME_CONFIG.metricLabels)
        .map(([key, label]) => renderMetricMeter(key, label, metrics[key]))
        .join("")}</div>
    </div>`;
}

function renderStepOne(state) {
  return `
    <fieldset class="game-step__fieldset">
      <legend>第一關：這次作品想說什麼？</legend>
      <p class="game-step__hint">先選擇方向。沒有哪個主題會自動換來成功。</p>
      <div class="game-choice-grid">${GAME_THEMES.map((choice) => renderChoice(choice, "theme", state.themeId)).join("")}</div>
    </fieldset>`;
}

function renderStepTwo(state) {
  return `
    <fieldset class="game-step__fieldset">
      <legend>第二關：誰完成歌曲？</legend>
      <p class="game-step__hint">創作自主與專業合作不是二選一；credit 讓我們看見每個角色。</p>
      <div class="game-choice-grid">${PRODUCTION_CHOICES.map((choice) => renderChoice(choice, "production", state.productionId)).join("")}</div>
    </fieldset>`;
}

function renderStepThree(state) {
  const validation = validateAllocation(state.allocation);
  return `
    <fieldset class="game-step__fieldset allocation-fieldset">
      <legend>第三關：分配 10 枚企劃點</legend>
      <p class="game-step__hint">完全忽略休息會降低危機處理能力；只重宣傳也可能讓作品失去辨識度。</p>
      <div class="allocation-grid">${Object.entries(GAME_CONFIG.allocationLabels)
        .map(
          ([key, label]) => `
          <label class="allocation-control">
            <span>${escapeHtml(label)}</span>
            <span class="allocation-control__input">
              <button type="button" data-action="decrement" data-allocation="${key}" aria-label="減少${escapeHtml(label)}企劃點">−</button>
              <input type="number" inputmode="numeric" min="0" max="10" step="1" name="allocation-${key}" data-allocation-input="${key}" value="${state.allocation[key]}" aria-describedby="allocation-status" />
              <button type="button" data-action="increment" data-allocation="${key}" aria-label="增加${escapeHtml(label)}企劃點">＋</button>
            </span>
          </label>`,
        )
        .join("")}</div>
      <p id="allocation-status" class="allocation-status ${validation.valid ? "is-valid" : "is-invalid"}" aria-live="polite">${escapeHtml(validation.message)}</p>
    </fieldset>`;
}

function renderStepFour(state) {
  const event = GAME_EVENTS.find((item) => item.id === state.eventId) ?? GAME_EVENTS[0];
  return `
    <div class="event-card">
      <p class="event-card__label">第四關：突發事件</p>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description)}</p>
    </div>
    <fieldset class="game-step__fieldset">
      <legend>你要怎麼處理？</legend>
      <div class="game-choice-grid">${event.choices.map((choice) => renderChoice(choice, "event-choice", state.eventChoiceId)).join("")}</div>
    </fieldset>`;
}

function renderStepFive(state) {
  const result = getResult(state);
  const metricLabel = GAME_CONFIG.metricLabels[result.strongestMetric];
  const tradeoffLabel = GAME_CONFIG.metricLabels[result.tradeoffMetric];
  return `
    <article class="result-card" aria-labelledby="result-title">
      <p class="result-card__eyebrow">你的企劃人格</p>
      <h3 id="result-title">${escapeHtml(result.profile.label)}</h3>
      <p class="result-card__insight">${escapeHtml(result.profile.insight)}</p>
      <div class="result-card__balance">
        <p><span>最被你保護的</span><strong>${escapeHtml(metricLabel)}</strong></p>
        <p><span>這次最大的取捨</span><strong>${escapeHtml(tradeoffLabel)}</strong></p>
      </div>
      <blockquote>${escapeHtml(result.shareText)}</blockquote>
      <label class="share-fallback" for="share-text">分享文字</label>
      <textarea id="share-text" readonly rows="3" aria-describedby="share-text-help">${escapeHtml(result.shareText)}</textarea>
      <p id="share-text-help" class="sr-only">可用複製按鈕，或聚焦後使用鍵盤複製。</p>
      <div class="result-card__actions">
        <button class="button button--primary" type="button" data-action="copy-result">複製分享文字</button>
        <button class="button button--ghost" type="button" data-action="reset-game">重新企劃</button>
      </div>
      <p class="game-live" data-copy-status aria-live="polite"></p>
    </article>`;
}

export function renderGame(root, state) {
  const stepLabels = ["作品主題", "製作方式", "資源分配", "突發事件", "結果卡"];
  const panels = [renderStepOne, renderStepTwo, renderStepThree, renderStepFour, renderStepFive];
  const currentStep = Math.max(1, Math.min(panels.length, Number(state.step) || 1));
  const canGoNext =
    (currentStep === 1 && Boolean(state.themeId)) ||
    (currentStep === 2 && Boolean(state.productionId)) ||
    (currentStep === 3 && validateAllocation(state.allocation).valid) ||
    (currentStep === 4 && Boolean(state.eventChoiceId));

  root.innerHTML = `
    <div class="game-notice"><strong>教育模擬</strong><p>${escapeHtml(SITE_META.simulationNotice)}</p></div>
    <ol class="game-steps" aria-label="遊戲進度">${stepLabels
      .map((label, index) => `<li class="${currentStep === index + 1 ? "is-current" : currentStep > index + 1 ? "is-complete" : ""}" ${currentStep === index + 1 ? 'aria-current="step"' : ""}><span>${index + 1}</span>${escapeHtml(label)}</li>`)
      .join("")}</ol>
    ${renderResourceSummary(state)}
    <section class="game-panel" tabindex="-1" role="region" aria-labelledby="game-step-title">
      <h2 id="game-step-title" class="sr-only">第 ${currentStep} 關：${escapeHtml(stepLabels[currentStep - 1])}</h2>
      ${panels[currentStep - 1](state)}
    </section>
    ${
      currentStep < 5
        ? `<div class="game-controls">
            <button class="button button--ghost" type="button" data-action="previous-step" ${currentStep === 1 ? "disabled" : ""}>上一步</button>
            <button class="button button--primary" type="button" data-action="next-step" ${canGoNext ? "" : "disabled"}>${currentStep === 4 ? "看企劃結果" : "下一步"}</button>
          </div>`
        : ""
    }
    <p class="game-live" data-game-status aria-live="polite"></p>`;
}
