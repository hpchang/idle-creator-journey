# 素材授權狀態

網站使用兩類視覺素材：

1. 自行撰寫的 CSS 圖形與 `og-placeholder.svg`。
2. `images/commons/` 中由 Wikimedia Commons 取得並自行託管的 CC 授權人物圖片。

## 目錄

- `images/commons/originals/`：通過授權與畫面 gate 的原始檔，供 provenance、尺寸與 SHA-256 驗證；網站不直接載入。
- `images/commons/*.jpg`：網站實際載入的壓縮／裁切衍生檔。
- `images/commons/I-dle_2025_Soyeon_singing.png` 與 `idle-2025-*.webp`：M01 已退役來源及舊衍生檔，只保留 provenance，不在 active DOM 使用。

目前 active 圖片包括：

- 2024 MMA red carpet 團體圖
- 2018-05-02〈LATATA〉debut showcase photo-time
- 2024 Tacoma concert
- Miyeon 2025、Minnie 2025、Soyeon 2024、Yuqi 2025 單人圖
- Shuhua 成員卡使用姓名卡 fallback；不為湊滿五張而使用缺乏審查證據的候選

完整作者、原始 URL、授權核對、雜湊、裁切方式與語境限制見 [`docs/MEDIA_REGISTER.md`](../docs/MEDIA_REGISTER.md)。結構化 runtime registry 位於 [`src/data/media.mjs`](../src/data/media.mjs)。

Creative Commons 授權適用於圖片著作權，不代表取得成員肖像權、人格權、商標權或官方背書。本站不使用授權不明的新聞社照片、Pinterest／粉絲站圖片或官方宣傳照。

新增圖片時必須逐張記錄：

- 檔名、`sourceId` 與 `photoId`
- 作者／權利人與原始來源 URL
- 授權條款、授權 URL 與 Commons review evidence
- 查閱日期、原始尺寸與 SHA-256
- 裁切、縮放或格式修改方式
- alt、caption、年代、人物與 placement
- `active`、`retired`、`pending` 或 `rejected` 狀態

未確認授權與人物／構圖前不得放入公開版本。
