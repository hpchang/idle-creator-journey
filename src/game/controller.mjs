import { GAME_CONFIG } from "../data/game.mjs";
import { setLiveMessage } from "../ui.mjs";
import {
  applyAllocation,
  applyEventChoice,
  applyProductionChoice,
  applyThemeChoice,
  createInitialState,
  normalizeSeed,
  setEvent,
  validateAllocation,
} from "./model.mjs";
import { renderGame } from "./view.mjs";

function randomSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    globalThis.crypto.getRandomValues(values);
    return values[0];
  }
  return Math.floor(Math.random() * 0x7fffffff);
}

function captureFocus(root) {
  const active = document.activeElement;
  if (!active || !root.contains(active)) return null;
  if (active.classList.contains("game-panel")) return { type: "panel" };
  if (active instanceof HTMLInputElement) {
    if (active.dataset.allocationInput) return { type: "allocation", key: active.dataset.allocationInput };
    if (active.name) return { type: "choice", name: active.name, value: active.value };
  }
  if (active instanceof HTMLButtonElement && active.dataset.action) {
    return { type: "button", action: active.dataset.action, allocation: active.dataset.allocation };
  }
  if (active instanceof HTMLTextAreaElement && active.id) return { type: "id", id: active.id };
  return null;
}

function restoreFocus(root, focus) {
  if (!focus) return false;
  let target = null;
  if (focus.type === "panel") target = root.querySelector(".game-panel");
  if (focus.type === "allocation") {
    target = [...root.querySelectorAll("[data-allocation-input]")].find((input) => input.dataset.allocationInput === focus.key);
  }
  if (focus.type === "choice") {
    target = [...root.querySelectorAll("input")].find((input) => input.name === focus.name && input.value === focus.value);
  }
  if (focus.type === "button") {
    target = [...root.querySelectorAll("button[data-action]")].find(
      (button) => button.dataset.action === focus.action && button.dataset.allocation === focus.allocation,
    );
  }
  if (focus.type === "id") target = root.querySelector(`#${focus.id}`);
  target?.focus();
  return Boolean(target);
}

export function initGame(root) {
  if (!root) return;
  const rawSeed = new URLSearchParams(window.location.search).get("seed");
  const parsedSeed = Number(rawSeed);
  const seed = rawSeed === null ? randomSeed() : Number.isFinite(parsedSeed) ? normalizeSeed(parsedSeed) : 0;
  let state = createInitialState(seed);
  let lastRenderedStep = null;

  const update = ({ focusSelector } = {}) => {
    const previousFocus = captureFocus(root);
    renderGame(root, state);
    const explicitTarget = focusSelector ? root.querySelector(focusSelector) : null;
    if (explicitTarget) explicitTarget.focus();
    else if (previousFocus) restoreFocus(root, previousFocus);
    if (state.step !== lastRenderedStep) {
      const labels = ["作品主題", "製作方式", "資源分配", "突發事件", "企劃結果"];
      const message = state.step === 5 ? "已產生企劃結果，可以複製分享文字或重新企劃。" : `已進入第 ${state.step} 關：${labels[state.step - 1]}。`;
      setLiveMessage(root.querySelector("[data-game-status]"), message);
      lastRenderedStep = state.step;
    }
  };

  const moveNext = () => {
    if (state.step === 1 && state.themeId) state = { ...state, step: 2 };
    else if (state.step === 2 && state.productionId) state = { ...state, step: 3 };
    else if (state.step === 3) {
      const validation = validateAllocation(state.allocation);
      if (!validation.valid) {
        setLiveMessage(root.querySelector("[data-game-status]"), validation.message);
        return;
      }
      state = setEvent({ ...state, step: 4 });
    } else if (state.step === 4 && state.eventChoiceId) state = { ...state, step: 5 };
    update({ focusSelector: ".game-panel" });
  };

  root.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;

    if (input.name === "theme") state = applyThemeChoice(state, input.value);
    if (input.name === "production") state = applyProductionChoice(state, input.value);
    if (input.name === "event-choice") state = applyEventChoice(state, input.value);
    if (input.dataset.allocationInput) {
      const value = Math.max(0, Math.min(10, Number.parseInt(input.value || "0", 10) || 0));
      state = { ...state, allocation: { ...state.allocation, [input.dataset.allocationInput]: value } };
    }
    update();
  });

  root.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    if (action === "next-step") moveNext();
    if (action === "previous-step") {
      state = { ...state, step: Math.max(1, state.step - 1) };
      update({ focusSelector: ".game-panel" });
    }
    if (action === "increment" || action === "decrement") {
      const key = button.dataset.allocation;
      const current = Number(state.allocation[key] ?? 0);
      const next = Math.max(0, Math.min(10, current + (action === "increment" ? 1 : -1)));
      state = { ...state, allocation: { ...state.allocation, [key]: next } };
      update({ focusSelector: `[data-action="${action}"][data-allocation="${key}"]` });
    }
    if (action === "reset-game") {
      state = createInitialState(state.seed);
      update({ focusSelector: 'input[name="theme"]' });
    }
    if (action === "copy-result") {
      const textarea = root.querySelector("#share-text");
      const status = root.querySelector("[data-copy-status]");
      try {
        await navigator.clipboard.writeText(textarea.value);
        setLiveMessage(status, "分享文字已複製。不同平台顯示方式可能不同。"
        );
      } catch {
        textarea.focus();
        textarea.select();
        setLiveMessage(status, "瀏覽器未允許自動複製；文字已選取，請手動複製。"
        );
      }
    }
  });

  root.addEventListener("keydown", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.dataset.allocationInput) return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const key = event.target.dataset.allocationInput;
    const current = Number(state.allocation[key] ?? 0);
    const next = Math.max(0, Math.min(10, current + (event.key === "ArrowUp" ? 1 : -1)));
    state = { ...state, allocation: { ...state.allocation, [key]: next } };
    update({ focusSelector: `[data-allocation-input="${key}"]` });
  });

  update();
}
