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
