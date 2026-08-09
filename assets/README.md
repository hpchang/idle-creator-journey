# 素材授權狀態

網站使用兩類視覺素材：

1. 自行撰寫的 CSS 圖形與原創站標 `favicon.svg`、`apple-touch-icon.png`。
2. `images/commons/` 中由 Wikimedia Commons 取得並自行託管的 CC 授權人物圖片。
3. `og-idle-creator-journey.jpg`：社群分享預覽圖，由 M14 原圖裁切並疊加標題文字而成；依 ShareAlike 條款同樣以 CC BY-SA 4.0 釋出。

## 目錄

- `images/commons/originals/`：通過授權與畫面 gate 的原始檔，供 provenance、尺寸與 SHA-256 驗證；網站不直接載入。
- `images/commons/*.jpg`：網站實際載入的壓縮／裁切／補黑衍生檔。
- `images/commons/I-dle_2025_Soyeon_singing.png` 與 `idle-2025-*.webp`：M01 已退役來源及舊衍生檔，只保留 provenance，不在 active DOM 使用。
- `miyeon-2025.jpg`、`minnie-2025.jpg`、`soyeon-2024.jpg`、`yuqi-2025.jpg`：第 03 章上一版單人照片，已退役但保留供登錄與雜湊核對。

目前 active 圖片包括：

- 2024 MMA red carpet 團體圖
- 2018-05-02〈LATATA〉debut showcase photo-time
- 2024 Tacoma concert
- Miyeon、Minnie、Soyeon、Yuqi、Shuhua 的 2023-09-11 Amsterdam concert 單人舞台照

第 03 章五張成員照均由 Robbie Klinkenberg 在同一場演唱會拍攝，採 CC BY-SA 4.0。網站衍生檔保留完整原圖比例、縮小至高 800px，再置中補黑為 640×800；CSS 以同一圓形裁切、暗角與色彩處理呈現，不去背、不合成人物。

完整作者、原始 URL、授權核對、雜湊、修改方式與語境限制見 [`docs/MEDIA_REGISTER.md`](../docs/MEDIA_REGISTER.md)。結構化 runtime registry 位於 [`src/data/media.mjs`](../src/data/media.mjs)。

Creative Commons 授權適用於圖片著作權，不代表取得成員肖像權、人格權、商標權或官方背書。本站不使用授權不明的新聞社照片、Pinterest／粉絲站圖片或官方宣傳照。

新增圖片時必須逐張記錄：

- 檔名、`sourceId` 與 `photoId`
- 作者／權利人與原始來源 URL
- 授權條款、授權 URL 與 Commons review evidence
- 查閱日期、原始尺寸與 SHA-256
- 裁切、縮放、補黑或格式修改方式
- alt、caption、年代、人物與 placement
- `active`、`retired`、`pending` 或 `rejected` 狀態

未確認授權與人物／構圖前不得放入公開版本。
