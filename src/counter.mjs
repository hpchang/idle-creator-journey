/* ---------- 瀏覽計數器（Cloudflare Worker + KV，多站共用）----------
   沒有金鑰：可存取的 slug 由 Worker 端的硬編碼白名單決定，未知 slug 回 404。

   GET  <BASE>/<slug>   只讀取，不累加。
   POST <BASE>/<slug>   先累加再回傳。
   兩者都回 {"count":N}。

   這份檔案在多個網站各放一份副本；唯一允許的差異是 base URL、slug
   與顯示元素 id。                                                      */

const VIEWS_BASE = "https://views-counter.views-counter-worker.workers.dev";
const TIMEOUT_MS = 8000;

function safeStorageGet(key) {
  try { return sessionStorage.getItem(key); } catch (_) { return null; }
}
function safeStorageSet(key, val) {
  try { sessionStorage.setItem(key, val); } catch (_) { /* 受限環境忽略 */ }
}

/**
 * 初始化瀏覽計數器。
 * @param {string} slug  頁面 slug，必須在 Worker 的 slug 白名單內
 */
export function initCounter(slug) {
  const line = document.getElementById("hits-line");
  const out  = document.getElementById("hits");
  if (!line || !out) return;

  const storageKey = `hits-counted:${slug}`;
  const seen = safeStorageGet(storageKey) === "1";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  fetch(`${VIEWS_BASE}/${encodeURIComponent(slug)}`, {
    method: seen ? "GET" : "POST",
    signal: controller.signal,
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      clearTimeout(timer);
      const n = data?.count;
      if (typeof n !== "number" || !Number.isFinite(n)) return;
      out.textContent = n.toLocaleString("zh-TW");
      line.hidden = false;
      if (!seen) safeStorageSet(storageKey, "1");
    })
    .catch(() => {
      clearTimeout(timer);
      /* 計數失敗就不顯示，不影響頁面其他部分。
         不寫入 sessionStorage，讓下次仍可嘗試累加。 */
    });
}
