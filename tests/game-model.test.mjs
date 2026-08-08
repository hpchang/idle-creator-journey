import test from "node:test";
import assert from "node:assert/strict";

import {
  GAME_CONFIG,
  GAME_EVENTS,
  GAME_THEMES,
  PRODUCTION_CHOICES,
} from "../src/data/game.mjs";
import {
  applyAllocation,
  applyEventChoice,
  applyProductionChoice,
  applyThemeChoice,
  chooseEventId,
  computeGameState,
  createInitialState,
  deriveResultProfile,
  getResult,
  resetGame,
  setEvent,
  validateAllocation,
} from "../src/game/model.mjs";

const validAllocation = { music: 2, stage: 2, mv: 2, promo: 2, rest: 2 };

function completeState({ seed = 0, themeIndex = 0, productionIndex = 0, allocation = validAllocation, eventChoiceIndex = 0 } = {}) {
  let state = createInitialState(seed);
  state = applyThemeChoice(state, GAME_THEMES[themeIndex].id);
  state = applyProductionChoice(state, PRODUCTION_CHOICES[productionIndex].id);
  state = applyAllocation(state, allocation);
  state = setEvent(state);
  const event = GAME_EVENTS.find((item) => item.id === state.eventId);
  state = applyEventChoice(state, event.choices[eventChoiceIndex % event.choices.length].id);
  return { ...state, step: 5 };
}

function dominatesProduction(a, b) {
  const metricKeys = Object.keys(GAME_CONFIG.metricLabels);
  const resourceKeys = Object.keys(GAME_CONFIG.initialResources);
  const metricsAtLeast = metricKeys.every((key) => (a.metrics[key] ?? 0) >= (b.metrics[key] ?? 0));
  const resourcesAtLeast = resourceKeys.every((key) => (a.resources[key] ?? 0) >= (b.resources[key] ?? 0));
  const strictlyBetter = metricKeys.some((key) => (a.metrics[key] ?? 0) > (b.metrics[key] ?? 0)) || resourceKeys.some((key) => (a.resources[key] ?? 0) > (b.resources[key] ?? 0));
  return metricsAtLeast && resourcesAtLeast && strictlyBetter;
}

test("initial state and reset expose the required virtual resources", () => {
  const initial = createInitialState(7);
  assert.equal(initial.step, 1);
  assert.equal(initial.seed, 7);
  assert.deepEqual(initial.allocation, { music: 0, stage: 0, mv: 0, promo: 0, rest: 0 });
  assert.deepEqual(computeGameState(initial).resources, GAME_CONFIG.initialResources);
  assert.deepEqual(resetGame(7), initial);
});

test("allocation validation covers missing, exact, over, negative, decimal, and unknown fields", () => {
  assert.equal(validateAllocation({}).valid, false);
  assert.equal(validateAllocation(validAllocation).valid, true);
  assert.equal(validateAllocation({ ...validAllocation, rest: 3 }).valid, false);
  assert.equal(validateAllocation({ ...validAllocation, rest: -1 }).valid, false);
  assert.equal(validateAllocation({ ...validAllocation, rest: 1.5 }).valid, false);
  assert.equal(validateAllocation({ ...validAllocation, extra: 4 }).valid, false, "unknown allocation keys must not silently consume points");
  assert.throws(() => applyAllocation(createInitialState(), { ...validAllocation, extra: 4 }), /企劃點|allocation|未知/);
});

test("valid allocation is cloned, normalized, and cannot mutate the prior state", () => {
  const initial = createInitialState();
  const allocation = { music: "2", stage: 2, mv: 2, promo: 2, rest: 2 };
  const next = applyAllocation(initial, allocation);
  assert.deepEqual(next.allocation, validAllocation);
  assert.notEqual(next, initial);
  assert.deepEqual(initial.allocation, { music: 0, stage: 0, mv: 0, promo: 0, rest: 0 });
  allocation.music = "9";
  assert.equal(next.allocation.music, 2);
});

test("all themes and production choices can enter a deterministic event route", () => {
  for (let themeIndex = 0; themeIndex < GAME_THEMES.length; themeIndex += 1) {
    for (let productionIndex = 0; productionIndex < PRODUCTION_CHOICES.length; productionIndex += 1) {
      const state = completeState({ themeIndex, productionIndex });
      assert.ok(GAME_EVENTS.some((event) => event.id === state.eventId));
      const result = getResult(state);
      assert.ok(result.profile.id);
      assert.match(result.shareText, /如果沒有人替我準備舞台/);
      assert.ok(Object.values(result.metrics).every(Number.isInteger));
      assert.ok(Object.values(result.metrics).every((value) => value >= 0 && value <= 100));
      assert.ok(result.resources.points >= 0 && result.resources.energy >= 0 && result.resources.weeks >= 0);
    }
  }
});

test("every event seed and every event choice reaches a result", () => {
  const seen = new Set();
  for (let seed = 0; seed < GAME_EVENTS.length; seed += 1) {
    const state = completeState({ seed });
    seen.add(state.eventId);
    const event = GAME_EVENTS.find((item) => item.id === state.eventId);
    for (let choiceIndex = 0; choiceIndex < event.choices.length; choiceIndex += 1) {
      const route = completeState({ seed, eventChoiceIndex: choiceIndex });
      assert.doesNotThrow(() => getResult(route));
      assert.equal(route.eventChoiceId, event.choices[choiceIndex].id);
    }
  }
  assert.equal(seen.size, GAME_EVENTS.length, "integer seed range must expose every event");
});

test("event, theme, production, and choice validation rejects unknown IDs", () => {
  const initial = createInitialState();
  assert.throws(() => applyThemeChoice(initial, "missing-theme"), /未知/);
  assert.throws(() => applyProductionChoice(initial, "missing-production"), /未知/);
  assert.throws(() => setEvent(initial, "missing-event"), /未知/);
  assert.throws(() => applyEventChoice({ ...initial, eventId: GAME_EVENTS[0].id }, "missing-choice"), /未知/);
  assert.throws(() => getResult(initial), /尚未完成/);
});

test("decimal and non-finite seed boundaries always resolve to a valid event", () => {
  for (const seed of [1.5, -2.75, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    const state = { ...createInitialState(seed), themeId: GAME_THEMES[0].id, productionId: PRODUCTION_CHOICES[0].id };
    assert.doesNotThrow(() => chooseEventId(state), `seed ${String(seed)} must not crash the event route`);
    assert.ok(GAME_EVENTS.some((event) => event.id === chooseEventId(state)));
  }
});

test("resource deltas clamp at zero and rest can soften a negative health event", () => {
  const noRest = completeState({ allocation: { music: 4, stage: 4, mv: 2, promo: 0, rest: 0 } });
  const withRest = completeState({ allocation: { music: 2, stage: 2, mv: 2, promo: 0, rest: 4 } });
  const noRestComputed = computeGameState(noRest);
  const withRestComputed = computeGameState(withRest);
  assert.ok(noRestComputed.resources.points >= 0 && noRestComputed.resources.energy >= 0 && noRestComputed.resources.weeks >= 0);
  assert.ok(withRestComputed.resources.points >= 0 && withRestComputed.resources.energy >= 0 && withRestComputed.resources.weeks >= 0);
  assert.ok(withRestComputed.history.some((item) => item.includes("休息與備案")) || withRestComputed.metrics.health >= noRestComputed.metrics.health);
});

test("no production strategy is a strict resource-and-metric domination of another", () => {
  const computed = PRODUCTION_CHOICES.map((choice) => computeGameState({
    ...createInitialState(),
    themeId: GAME_THEMES[2].id,
    productionId: choice.id,
    allocation: validAllocation,
  }));
  for (let a = 0; a < computed.length; a += 1) {
    for (let b = 0; b < computed.length; b += 1) {
      if (a !== b) assert.equal(dominatesProduction(computed[a], computed[b]), false, `${PRODUCTION_CHOICES[a].id} must not dominate ${PRODUCTION_CHOICES[b].id}`);
    }
  }
});

test("results are deterministic and contain no fabricated commercial outcomes", () => {
  const state = completeState({ seed: 3, themeIndex: 2, productionIndex: 1, eventChoiceIndex: 2 });
  const first = getResult(state);
  const second = getResult(structuredClone(state));
  assert.deepEqual(first, second);
  assert.doesNotMatch(first.shareText, /(?:銷量|榜單|排名|收入|薪資|美元|韓元|元)/);
  assert.ok(first.profile.metricKeys?.length ?? first.profile.id === "mixed");
  assert.ok(["clarity", "music", "reach", "health", "brand"].includes(first.strongestMetric));
  assert.ok(["clarity", "music", "reach", "health", "brand"].includes(first.tradeoffMetric));
});

test("profile scoring is finite for every valid metric vector", () => {
  for (const profile of ["clarity", "music", "reach", "health", "brand"]) {
    const metrics = Object.fromEntries(Object.keys(GAME_CONFIG.metricLabels).map((key) => [key, profile === key ? 100 : 0]));
    const result = deriveResultProfile(metrics);
    assert.ok(Number.isFinite(result.score));
    assert.ok(result.label && result.phrase && result.insight);
  }
});
