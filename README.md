# i-dle 青少年互動網站

本資料夾用於製作一個以青少年為主要對象的 i-dle（原名 (G)I-DLE）互動式長篇網站。

## 線上網站

- 正式網站：<https://www.hpchang.com/idle-creator-journey/>
- GitHub repository：<https://github.com/hpchang/idle-creator-journey>
- 部署與更新流程：[`DEPLOY.md`](./DEPLOY.md)

## 開始前必讀

1. [`CLAUDE.md`](./CLAUDE.md) — 實作代理必須遵守的專案規則與已確認決策
2. [`docs/PROJECT_BRIEF.md`](./docs/PROJECT_BRIEF.md) — 完整產品、內容、互動及驗收規格
3. [`docs/SOURCE_REGISTER.md`](./docs/SOURCE_REGISTER.md) — 逐項事實來源、可支持敘述與限制
4. [`.claude/skills/build-idle-site/SKILL.md`](./.claude/skills/build-idle-site/SKILL.md) — 建站執行流程

## 已確認方向

- 主體採「練習生與成長故事」敘事。
- 中段加入「策劃一次女團回歸」互動遊戲。
- SEO 標題：`認識 i-dle｜五個女孩如何從練習生變成創作者`
- 首頁 H1：`如果沒有人替你準備舞台，你能不能自己創造一個？`
- 內容必須以可核驗來源為基礎，禁止將傳聞、收入推估或未定論指控寫成事實。

## 技術架構

- 語意 HTML、原生 CSS、Vanilla JavaScript ES modules
- 無應用程式後端、登入、CMS 或 runtime framework；網站本體維持靜態部署
- `src/counter.mjs` 只透過受限 Supabase RPC 顯示匿名瀏覽次數；失敗時不影響網站功能
- 內容、來源、歌曲 credit 與遊戲規則集中在 `src/data/`
- 遊戲計算集中在 `src/game/model.mjs`，可用 `node:test` 獨立驗證
- 人物圖片只使用已核對 Commons review evidence 的 CC 授權素材，原檔、衍生檔與授權分別登錄於 `src/data/media.mjs` 與 `docs/MEDIA_REGISTER.md`

## 本機執行

```bash
npm install
npm run serve
```

開啟 <http://localhost:4173>。

## 測試

```bash
npm test
npm run test:browser
```

瀏覽器測試使用本機 Chrome，檢查多種 viewport、完整遊戲流程、鍵盤操作、來源連結、橫向溢出、console 錯誤及 `prefers-reduced-motion`。

## 內容維護

新增任何重大事實前，先更新 `docs/SOURCE_REGISTER.md`，再把敘述與 source ID 放入 `src/data/`。不可用無來源傳聞補空白，也不可推估成員收入、身價、家庭背景、續約條件或未公開分潤。
