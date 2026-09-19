---
name: build-idle-site
description: 依據已核實的專案 brief 與來源，規劃、實作及驗證 i-dle 青少年互動長篇網站。
---

# Build i-dle Teen Website

## 何時使用

當任務涉及此資料夾內 i-dle 網站的規劃、實作、內容撰寫、互動遊戲、視覺調整、測試或驗證時使用。

## 必讀順序

1. `/Users/hpchang/Documents/claude/MyProjects/idle/CLAUDE.md`
2. `/Users/hpchang/Documents/claude/MyProjects/idle/docs/PROJECT_BRIEF.md`
3. `/Users/hpchang/Documents/claude/MyProjects/idle/docs/SOURCE_REGISTER.md`
4. `/Users/hpchang/Documents/claude/MyProjects/idle/docs/MEDIA_REGISTER.md`
5. 若執行內容擴寫任務：`/Users/hpchang/Documents/claude/MyProjects/idle/docs/CONTENT_EXPANSION_HANDOFF.md`

不可只根據一般模型知識撰寫團體事實。

## 執行流程

### 1. 盤點現況

- 列出目前檔案、技術棧與可用資產。
- 若專案仍為空，選擇可靜態部署、維護成本最低的方案。
- 不自行加入登入、後端、資料庫或重型 CMS。

### 2. 建立資訊架構

至少包含：

- Hero
- 團體快速時間軸
- 五位成員故事
- 練習生情境選擇
- 2018 出道與早期創作
- 2021 團體轉折
- 2022《I NEVER DIE》與〈TOMBOY〉
- 正式歌曲 credit 創作室
- 回歸企劃遊戲
- 串流與音樂收入機制
- 2024 續約、2025 改名
- 給青少年的結語
- 來源與方法

### 3. 建立內容資料層

- 將章節內容、成員資料、歌曲 credit、來源及遊戲選項放入結構化資料。
- 每個事實保存 source ID。
- 頁面顯示可點擊的來源標籤。
- 若來源不在 SOURCE_REGISTER，不得直接新增重大事實；先查證並更新 register。

### 4. 實作視覺系統

- 手機優先。
- 建立可重用的 section、story card、source badge、decision card、meter、result card。
- 視覺主題為「練習生日記逐步轉成成熟舞台」。
- 不複製參考 BLACKPINK 網站的粉黑視覺。
- 遵守可讀性、對比、鍵盤操作及 reduced-motion。

### 5. 實作回歸企劃遊戲

初始資源：

- 10 枚企劃點
- 5 點團隊能量
- 4 週準備時間

五項結果指標：

- 概念清晰度
- 音樂完成度
- 觀眾觸及
- 團隊健康
- 長期品牌價值

流程：

1. 選擇作品主題
2. 選擇歌曲製作方式
3. 分配企劃點至音樂、舞台、MV、宣傳、休息與備案
4. 處理一個突發事件
5. 產生企劃人格與分享卡

限制：

- 不使用真實貨幣。
- 不生成虛構銷量或收入。
- 不設唯一滿分路線。
- 必須說明此為教育模擬。

### 6. 驗證內容

逐項核對：

- 2018 六人出道。
- 2021 官方宣布離團與五人體制，不對爭議下判決。
- 2022 五人以《I NEVER DIE》回歸。
- 官方 MV credit 拼字及角色正確。
- 2024 年底全員續約。
- 2025-05-02 改名 i-dle。
- Spotify 沒有固定 per-stream rate 的敘述正確。

### 7. 真實瀏覽器驗證

- 啟動網站並檢查手機、平板、桌面斷點。
- 完整玩完遊戲所有主要路線。
- 檢查鍵盤操作、focus、 reduced-motion、來源連結及分享卡。
- 檢查 console、404、overflow、CLS 與載入速度。

### 8. 內容擴寫（當任務為擴充章節正文時）

此階段在 UI/UX 改版完成後進行，規格見 `docs/CONTENT_EXPANSION_HANDOFF.md`。

- **不可 reset 或覆蓋既有 UI/UX 改版**，只在現狀上增量。
- 章節敘事資料放 `src/data/narrative.mjs`，匯出 `CHAPTER_NARRATIVES`（第 2-12 章）與 `MEMBER_NARRATIVES`。每章三層：`story`、`explanation`、`reflection`。
- 每個含可驗證敘述的單位攜帶 `sourceIds`（必須存在於 SOURCE_REGISTER）；純編輯提問/反思用 `editorial: true` 且不帶 `sourceIds`。
- 渲染器在 `src/ui.mjs`：`renderNarrativeParagraphs`、`renderStoryBlock`、`renderReflectionPrompt`。HTML hook 用 `data-narrature`/`data-reflection`。
- 優先擴寫章節：第 3、7、8、10 章，explanation 層 ≥2 個單元。
- 移除 Hero 的編輯防禦提示（`.hero__note`），把編輯界線集中說明於第 13 章一次（`data-editorial-rule`）。
- 桌面 1024px+：用 `chapter-layout` 雙欄（6fr/4fr），主敘事欄行寬 ≤40rem；手機維持單欄 DOM 順序，不用 CSS `order`。
- 密集章節（2、3、5、6、8、10、11）桌面 padding 減約 25%；轉場章節（1、7、9、12）保留較大留白。
- 不新增/修改圖片；不破壞遊戲規則、來源搜尋、TOC、resume、`＋`/`－`/Arrow 鍵穩定性。
- 完成定義見 handoff §11，包含 `npm test`、`npm run test:browser`、axe 六 viewport、真實瀏覽器 390/1440px 逐章驗收。

### 9. 視覺對比重點（深色場景）

使用者明確反映過：**深色場景（rehearsal 深紫、stage 近黑）下淡白色文字對比不足。**

- 深色 `data-scene` 場景的所有文字（副標題、敘事段落、fact-card、badge）必須用 `--color-dark-text`(#fdf7f8) 或 `--color-dark-muted`(#e0d3dd)。
- **不可用 `--color-ink-soft`(#4d4051)**——它在深紫底上幾乎不可讀（這是踩過的 bug）。
- source badge 預設透明背景、淡邊框、低調文字，hover 才浮現紫色；不應壓過正文。
- 深色場景裡 badge 也要用淺邊框+淺文字維持可讀。

### 10. 部署與正式站驗收

- 測試：`npm test`（21）、`npm run test:browser`（25，含 axe WCAG A/AA 六 viewport）。
- 正式站驗收：`IDLE_BASE_URL=https://www.hpchang.com/idle-creator-journey npm run test:browser`。
- 部署：`git push origin main` → GitHub Pages（`main`/`/` root）自動部署，無 build 步驟。
- 推送後用 `gh api repos/hpchang/idle-creator-journey/pages` 與 `.../pages/builds/latest` 確認 source=`main`/`/`、status=`built`、commit 符合；正式 HTTPS 回傳 200；metadata 正確。
- **已知陷阱**：瀏覽器測試的「外部連結應有 noopener」檢查，不能用 `/^https:\/\//` 判斷外部連結（HTTPS 正式站上同源 hash 連結會被誤判）。用跨來源判斷（`link.origin !== location.origin`）。

### 11. 瀏覽計數器

- 計數器在 `src/counter.mjs`：`GET <BASE>/<slug>` 讀取、`POST <BASE>/<slug>` 累加，兩者都回 `{"count":N}`，slug = `idle-creator-journey`，沒有金鑰，失敗靜默不影響頁面。
- 契約、部署與新站上線流程見 `/Users/hpchang/Documents/claude/MyProjects/VIEWS_COUNTER_STANDARD.md`（伺服器端在獨立的 Cloudflare Worker 專案）。
- 本 repo 不使用任何 GitHub Actions workflow，計數器也不需要 keep-alive。

## 禁止事項

- 不寫成八卦網站。
- 不使用未授權藝人照片。
- 不推估個人身價、收入、續約金或合約比例。
- 不把媒體詮釋寫成成員原話。
- 不把指控寫成定論。
- 不把「self-producing」寫成所有作品都由成員單獨完成。
- 不使用粉絲 wiki 作為核心來源。

## 交付報告

完成後回報：

- 使用的技術棧
- 已完成章節與互動
- 來源資料如何存放
- 執行與測試方式
- 瀏覽器驗證結果
- 尚未取得授權的圖片或待確認資料
