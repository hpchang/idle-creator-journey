/* ---------- 瀏覽計數器（Supabase，多站共用）----------
   publishable key 本來就是公開的：它會隨網頁送到每個訪客的瀏覽器。
   安全性不靠保密，而是靠資料庫端的設定——page_hits 這張表開啟了 RLS
   且沒有任何 policy，因此這把金鑰讀不到也寫不了它；只能呼叫下面兩個
   函式，而函式內固定了 slug 白名單，累加也只能更新既有列。

   這份檔案在多個網站各放一份副本；差異只在傳入的 slug 與顯示元素 id。    */

const URL_ = "https://eaawlrtrxwyurcfnekat.supabase.co";
const KEY  = "sb_publishable_zS96EY5Uddhaq06hjt04sQ_E8WarUjc";
const TIMEOUT_MS = 8000;

function safeStorageGet(key) {
  try { return sessionStorage.getItem(key); } catch (_) { return null; }
}
function safeStorageSet(key, val) {
  try { sessionStorage.setItem(key, val); } catch (_) { /* 受限環境忽略 */ }
}

/**
 * 初始化瀏覽計數器。
 * @param {string} slug  頁面 slug，必須在 Supabase 函式白名單內
 */
export function initCounter(slug) {
  const line = document.getElementById("hits-line");
  const out  = document.getElementById("hits");
  if (!line || !out) return;

  const storageKey = `hits-counted:${slug}`;
  const seen = safeStorageGet(storageKey) === "1";
  const fn   = seen ? "read_hits" : "bump_hits";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  fetch(`${URL_}/rest/v1/rpc/${fn}`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_slug: slug }),
  })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((n) => {
      clearTimeout(timer);
      if (typeof n !== "number") return;
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