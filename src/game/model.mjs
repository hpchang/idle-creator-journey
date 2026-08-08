import {
  GAME_CONFIG,
  GAME_EVENTS,
  GAME_THEMES,
  PRODUCTION_CHOICES,
  RESULT_PROFILES,
} from "../data/game.mjs";

const clone = (value) => {
  if (typeof globalThis.structuredClone === "function") return globalThis.structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function normalizeSeed(seed = 0) {
  const numericSeed = Number(seed);
  if (!Number.isFinite(numericSeed)) return 0;
  return Math.trunc(numericSeed);
}

function applyDeltas(target, deltas = {}) {
  Object.entries(deltas).forEach(([key, delta]) => {
    target[key] = (target[key] ?? 0) + delta;
  });
}

export function createInitialState(seed = 0) {
  return {
    step: 1,
    seed: normalizeSeed(seed),
    themeId: null,
    productionId: null,
    allocation: { music: 0, stage: 0, mv: 0, promo: 0, rest: 0 },
    eventId: null,
    eventChoiceId: null,
    history: [],
  };
}

export function applyThemeChoice(state, themeId) {
  if (!GAME_THEMES.some((choice) => choice.id === themeId)) throw new Error("未知的作品主題");
  return { ...clone(state), themeId, eventId: null, eventChoiceId: null };
}

export function applyProductionChoice(state, productionId) {
  if (!PRODUCTION_CHOICES.some((choice) => choice.id === productionId)) throw new Error("未知的製作方式");
  return { ...clone(state), productionId, eventId: null, eventChoiceId: null };
}

export function validateAllocation(allocation = {}) {
  const keys = Object.keys(GAME_CONFIG.allocationLabels);
  const unknownKeys = Object.keys(allocation).filter((key) => !keys.includes(key));
  const values = keys.map((key) => Number(allocation[key] ?? 0));
  const hasInvalid = values.some((value) => !Number.isInteger(value) || value < 0 || value > 10);
  const total = values.reduce((sum, value) => sum + value, 0);

  if (unknownKeys.length) return { valid: false, total, remaining: 10 - total, message: "企劃點只能分配到列出的五個項目。" };
  if (hasInvalid) return { valid: false, total, remaining: 10 - total, message: "每個項目都必須是 0 到 10 的整數。" };
  if (total !== 10) return { valid: false, total, remaining: 10 - total, message: `請剛好分配 10 枚企劃點；目前共 ${total} 枚。` };
  return { valid: true, total, remaining: 0, message: "10 枚企劃點已分配完成。" };
}

export function applyAllocation(state, allocation) {
  const validation = validateAllocation(allocation);
  if (!validation.valid) throw new Error(validation.message);
  const keys = Object.keys(GAME_CONFIG.allocationLabels);
  const normalizedAllocation = Object.fromEntries(keys.map((key) => [key, Number(allocation[key] ?? 0)]));
  return { ...clone(state), allocation: normalizedAllocation };
}

export function chooseEventId(state) {
  const themeIndex = Math.max(0, GAME_THEMES.findIndex((choice) => choice.id === state.themeId));
  const productionIndex = Math.max(0, PRODUCTION_CHOICES.findIndex((choice) => choice.id === state.productionId));
  const index = Math.abs(normalizeSeed(state.seed) + themeIndex * 2 + productionIndex * 3) % GAME_EVENTS.length;
  return GAME_EVENTS[index]?.id ?? GAME_EVENTS[0].id;
}

export function setEvent(state, eventId = chooseEventId(state)) {
  if (!GAME_EVENTS.some((event) => event.id === eventId)) throw new Error("未知的突發事件");
  return { ...clone(state), eventId, eventChoiceId: null };
}

export function applyEventChoice(state, eventChoiceId) {
  const event = GAME_EVENTS.find((item) => item.id === state.eventId);
  if (!event?.choices.some((choice) => choice.id === eventChoiceId)) throw new Error("未知的事件處理方式");
  return { ...clone(state), eventChoiceId };
}

export function computeGameState(state) {
  const metrics = clone(GAME_CONFIG.initialMetrics);
  const resources = clone(GAME_CONFIG.initialResources);
  const history = [];

  const theme = GAME_THEMES.find((choice) => choice.id === state.themeId);
  if (theme) {
    applyDeltas(metrics, theme.metrics);
    history.push(theme.label);
  }

  const production = PRODUCTION_CHOICES.find((choice) => choice.id === state.productionId);
  if (production) {
    applyDeltas(metrics, production.metrics);
    applyDeltas(resources, production.resources);
    history.push(production.label);
  }

  const allocation = state.allocation ?? {};
  const allocationKeys = Object.keys(GAME_CONFIG.allocationLabels);
  const allocationTotal = allocationKeys.reduce((sum, key) => sum + Number(allocation[key] || 0), 0);
  allocationKeys.forEach((category) => {
    const points = allocation[category] ?? 0;
    const effects = GAME_CONFIG.allocationEffects[category] ?? {};
    Object.entries(effects).forEach(([metric, delta]) => {
      metrics[metric] += Number(points || 0) * delta;
    });
  });
  resources.points = GAME_CONFIG.initialResources.points - allocationTotal;

  const event = GAME_EVENTS.find((item) => item.id === state.eventId);
  const eventChoice = event?.choices.find((choice) => choice.id === state.eventChoiceId);
  if (eventChoice) {
    applyDeltas(metrics, eventChoice.metrics);
    applyDeltas(resources, eventChoice.resources);
    if ((eventChoice.metrics?.health ?? 0) < 0 && Number(allocation.rest ?? 0) >= 2) {
      metrics.health += Math.min(Number(allocation.rest) * 2, 6);
      history.push("休息與備案降低了危機衝擊");
    }
    history.push(`${event.title}：${eventChoice.label}`);
  }

  Object.keys(metrics).forEach((key) => {
    metrics[key] = Math.round(clamp(metrics[key]));
  });
  resources.points = Math.max(0, resources.points);
  resources.energy = Math.max(0, resources.energy);
  resources.weeks = Math.max(0, resources.weeks);

  return { metrics, resources, history };
}

export function deriveResultProfile(metrics) {
  const ranked = RESULT_PROFILES.map((profile) => ({
    ...profile,
    score: profile.metricKeys.reduce((sum, key) => sum + metrics[key], 0) / profile.metricKeys.length,
  })).sort((a, b) => b.score - a.score);

  if (ranked[0].score - ranked[1].score <= 2) {
    return {
      id: "mixed",
      label: "混合企劃型",
      phrase: `${ranked[0].phrase}，也${ranked[1].phrase}`,
      insight: `你的企劃同時靠近「${ranked[0].label}」與「${ranked[1].label}」。這不是分數不夠明確，而是你願意讓兩種價值互相拉住。`,
      score: ranked[0].score,
    };
  }

  return ranked[0];
}

export function buildShareText(profile) {
  return `如果沒有人替我準備舞台，我會用${profile.phrase}的方式創造一個。`;
}

export function getResult(state) {
  if (!state.themeId || !state.productionId || !state.eventId || !state.eventChoiceId) {
    throw new Error("遊戲尚未完成");
  }
  const validation = validateAllocation(state.allocation);
  if (!validation.valid) throw new Error(validation.message);

  const computed = computeGameState(state);
  const profile = deriveResultProfile(computed.metrics);
  const rankedMetrics = Object.entries(computed.metrics).sort((a, b) => b[1] - a[1]);
  return {
    ...computed,
    profile,
    shareText: buildShareText(profile),
    strongestMetric: rankedMetrics[0][0],
    tradeoffMetric: rankedMetrics[rankedMetrics.length - 1][0],
  };
}

export function resetGame(seed = 0) {
  return createInitialState(seed);
}
