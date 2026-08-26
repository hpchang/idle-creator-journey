# i-dle Creator Journey 部署說明

## 正式站點

- 網站：https://www.hpchang.com/idle-creator-journey/
- GitHub：https://github.com/hpchang/idle-creator-journey

## 部署設定

本網站是可直接提供的靜態 HTML、CSS 與 Vanilla JavaScript ES modules，沒有 production build 步驟。`src/counter.mjs` 會從瀏覽器呼叫共用 Supabase RPC 顯示匿名瀏覽次數，但它不是 GitHub Pages 的部署依賴；請求失敗時網站仍可完整使用。

計數器只使用 publishable key，資料表由 RLS 隔離，前端只能呼叫已授權且含 slug 白名單的 `read_hits`／`bump_hits` RPC。不得把 service-role key 或資料庫密碼加入 repository。

GitHub Pages 設定：

```text
Visibility: Public
Source: Deploy from a branch
Branch: main
Folder: / (root)
Build type: legacy
Custom domain: 帳號層級 www.hpchang.com
```

專案不使用：

- `gh-pages` 分支
- repository-owned Pages Actions workflow（部署專用）
- project-level `CNAME`
- Cloudflare Pages 重複部署

專案使用的唯一 GitHub Actions workflow 是 `.github/workflows/supabase-keepalive.yml`——它不是部署 workflow，而是定時喚醒共享 Supabase Free tier project，避免 7 天無活動自動暫停。

站內 CSS、JavaScript 與圖片使用相對路徑，因此可在 `/idle-creator-journey/` 子路徑下運作。正式 canonical、`og:url`、Open Graph 圖片及 Article structured data URL 位於 `index.html`。

## 上線前驗證

```bash
npm test
npm run test:browser
```

測試正式網站：

```bash
IDLE_BASE_URL=https://www.hpchang.com/idle-creator-journey npm run test:browser
```

瀏覽器測試涵蓋：

- 360、390、768、1280 px viewport
- CSS、JavaScript、圖片與來源連結
- 橫向溢出與 console/page errors
- Axe WCAG 掃描
- 鍵盤操作與完整回歸企劃流程
- `prefers-reduced-motion`

## 發布更新

確認測試通過後：

```bash
git add -A
git commit -m "Update website"
git push
```

`main` 推送後，GitHub Pages 會自動部署根目錄。此 repository 的 `origin` 使用 HTTPS，以避免本機沒有可用 GitHub SSH key 時推送失敗。

## 檢查部署狀態

```bash
gh api repos/hpchang/idle-creator-journey/pages
gh api repos/hpchang/idle-creator-journey/pages/builds/latest
```

必要時可要求 GitHub Pages 重新建置最新 `main`：

```bash
gh api --method POST repos/hpchang/idle-creator-journey/pages/builds
```

最終驗收必須同時確認：

1. Pages source 是 `main`／`/`。
2. 最新 build status 是 `built`。
3. 正式 HTTPS 網址回傳 HTTP 200。
4. title、canonical、Open Graph metadata 正確。
5. 正式網址的瀏覽器測試通過。

## 首次部署紀錄

- 日期：2026-08-08
- 初次網站 commit：`8ea6a49`
- 正式路徑測試修正 commit：`7c024a1`
- 首次驗證：內容與遊戲測試 18/18、本機瀏覽器測試 14/14、正式站瀏覽器測試 14/14 通過。
