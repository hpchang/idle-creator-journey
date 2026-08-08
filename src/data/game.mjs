export const GAME_CONFIG = {
  initialResources: { points: 10, energy: 5, weeks: 4 },
  initialMetrics: { clarity: 50, music: 50, reach: 50, health: 50, brand: 50 },
  metricLabels: {
    clarity: "概念清晰度",
    music: "音樂完成度",
    reach: "觀眾觸及",
    health: "團隊健康",
    brand: "長期品牌價值",
  },
  allocationLabels: {
    music: "歌曲製作",
    stage: "編舞與舞台",
    mv: "MV 與視覺",
    promo: "宣傳",
    rest: "休息與備案",
  },
  allocationEffects: {
    music: { music: 4, clarity: 1 },
    stage: { reach: 2, music: 1, health: -1 },
    mv: { clarity: 2, reach: 2, brand: 1 },
    promo: { reach: 4, brand: 1 },
    rest: { health: 5, brand: 1 },
  },
};

export const GAME_THEMES = [
  {
    id: "trend",
    label: "市場熱門風格",
    description: "先讓觀眾快速理解，但作品可能較難留下獨特記憶。",
    metrics: { clarity: 4, reach: 10, brand: -3 },
  },
  {
    id: "appearance",
    label: "青少年外貌焦慮",
    description: "議題貼近生活，需要更細緻地避免把焦慮再複製一次。",
    metrics: { clarity: 10, music: 3, reach: 3, brand: 6 },
  },
  {
    id: "definition",
    label: "別人如何定義我",
    description: "訊息鮮明，適合把歌曲、造型與舞台整合成同一個問題。",
    metrics: { clarity: 8, music: 5, brand: 8 },
  },
  {
    id: "dance",
    label: "舞蹈導向",
    description: "舞台記憶點更直接，但排練量與身體負擔也會增加。",
    metrics: { clarity: 5, music: 4, reach: 7, health: -2 },
  },
  {
    id: "custom",
    label: "自訂主題",
    description: "自由度最高，也需要團隊投入更多時間把想法說清楚。",
    metrics: { clarity: 3, brand: 5, health: -1 },
  },
];

export const PRODUCTION_CHOICES = [
  {
    id: "external",
    label: "全部交給外部製作人",
    description: "團隊可以保留能量，但仍需要清楚溝通作品方向。",
    metrics: { music: 9, reach: 3, health: 4, brand: -2 },
    resources: { energy: 1 },
  },
  {
    id: "collaboration",
    label: "成員主導、外部協作",
    description: "把成員觀點與不同專業放在同一張 credit 裡。",
    metrics: { music: 7, clarity: 5, health: 1, brand: 7 },
    resources: {},
  },
  {
    id: "all-alone",
    label: "成員自己完成全部工作",
    description: "自主性高，但一個人扛下所有工作不必然比較好；官方主打歌 credit 也顯示多人合作。",
    metrics: { music: 11, clarity: 8, health: -10, brand: 9 },
    resources: { energy: -2, weeks: -1 },
    sourceIds: ["S12", "S13", "S14"],
  },
];

export const GAME_EVENTS = [
  {
    id: "member-health",
    title: "成員身體不適",
    description: "拍攝前夕，有成員需要休息。原定流程無法照表完成。",
    choices: [
      { id: "delay", label: "延後重要拍攝", metrics: { health: 12, music: 2, reach: -4, brand: 4 }, resources: { weeks: -1 } },
      { id: "reduce", label: "減少活動與動作負擔", metrics: { health: 9, reach: -3, brand: 3 } },
      { id: "maintain", label: "維持原計畫", metrics: { health: -15, reach: 5, brand: -8 }, resources: { energy: -2 } },
    ],
  },
  {
    id: "mv-delay",
    title: "MV 後製延遲",
    description: "視覺成品趕不上原本的發布節點。",
    choices: [
      { id: "delay", label: "延後發布", metrics: { clarity: 3, health: 5, reach: -5, brand: 4 }, resources: { weeks: -1 } },
      { id: "modify", label: "縮小視覺規模、守住核心", metrics: { clarity: 5, reach: -2, health: 2, brand: 2 } },
      { id: "maintain", label: "趕工維持日期", metrics: { reach: 5, health: -10, brand: -4 }, resources: { energy: -2 } },
    ],
  },
  {
    id: "concept-critique",
    title: "概念引發質疑",
    description: "第一波預告讓部分觀眾覺得訊息不夠清楚。",
    choices: [
      { id: "discuss", label: "重新討論並補充脈絡", metrics: { clarity: 10, health: 3, reach: -2, brand: 7 }, resources: { weeks: -1 } },
      { id: "modify", label: "修改容易誤解的部分", metrics: { clarity: 8, reach: 1, brand: 5 } },
      { id: "maintain", label: "維持原案並接受不同解讀", metrics: { clarity: -3, reach: 5, brand: 1 } },
    ],
  },
  {
    id: "busy-season",
    title: "同期作品很多",
    description: "同一週有許多新作品出現，觀眾注意力被分散。",
    choices: [
      { id: "delay", label: "調整發布時間", metrics: { reach: 5, health: 2, brand: 2 }, resources: { weeks: -1 } },
      { id: "modify", label: "集中說清楚一個亮點", metrics: { clarity: 8, reach: 4, brand: 4 } },
      { id: "maintain", label: "維持節奏，不追逐每個變化", metrics: { health: 5, reach: -2, brand: 5 } },
    ],
  },
  {
    id: "team-disagreement",
    title: "團隊方向分歧",
    description: "有人想強化市場反應，有人希望保留更尖銳的作品觀點。",
    choices: [
      { id: "discuss", label: "重新討論共同底線", metrics: { clarity: 7, health: 8, brand: 6 }, resources: { weeks: -1 } },
      { id: "modify", label: "各保留一個重要元素", metrics: { clarity: 4, music: 3, health: 3, brand: 4 } },
      { id: "maintain", label: "由原負責人維持決定", metrics: { clarity: 5, health: -7, brand: 1 } },
    ],
  },
];

export const RESULT_PROFILES = [
  {
    id: "creator",
    label: "創作者優先型",
    metricKeys: ["clarity", "music"],
    phrase: "先把作品真正想說的話做清楚",
    insight: "你把概念與音樂放在前面；下一步是確認團隊健康與觸及沒有被留在最後。",
  },
  {
    id: "market",
    label: "市場反應型",
    metricKeys: ["reach", "clarity"],
    phrase: "先找到觀眾能快速接住的入口",
    insight: "你擅長讓作品被看見；也要留意短期注意力是否支撐長期辨識度。",
  },
  {
    id: "stage",
    label: "舞台體驗型",
    metricKeys: ["music", "reach"],
    phrase: "用音樂與舞台建立第一個記憶點",
    insight: "你重視觀眾實際感受到的作品；高強度呈現仍需要休息與備案。",
  },
  {
    id: "long-term",
    label: "長期經營型",
    metricKeys: ["health", "brand"],
    phrase: "讓團隊有餘裕走得更久",
    insight: "你把健康與品牌延續放進決策；也可以再問，哪個創作觀點值得更大聲。",
  },
];
