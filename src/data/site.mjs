export const SITE_META = {
  title: "認識 i-dle｜五個女孩如何從練習生變成創作者",
  h1: "如果沒有人替你準備舞台，你能不能自己創造一個？",
  description:
    "從練習生、跨國追夢到參與歌曲創作，認識 i-dle 五位成員如何走過落選、團體轉折與重新出發。你也可以進入互動遊戲，親自策劃一次女團回歸。",
  updatedAt: "2026-08-07",
  firstMention: "i-dle（原名 (G)I-DLE）",
  simulationNotice:
    "本遊戲是根據音樂製作及回歸流程設計的教育模擬，不使用 Cube 或 i-dle 未公開的真實預算、合約及分潤資料。",
};

export const PHASES = [
  { id: "archive", label: "檔案", shortLabel: "FILE" },
  { id: "rehearsal", label: "排練", shortLabel: "REHEARSAL" },
  { id: "stage", label: "舞台", shortLabel: "STAGE" },
  { id: "creation", label: "創作", shortLabel: "CREATE" },
];

export const CHAPTERS = [
  { id: "hero", number: "01", label: "創造舞台", phaseId: "archive", sceneId: "archive", resumeEligible: true },
  { id: "who", number: "02", label: "她們是誰", phaseId: "archive", sceneId: "archive", resumeEligible: true },
  { id: "paths", number: "03", label: "五條不同的路", phaseId: "archive", sceneId: "archive", resumeEligible: true },
  { id: "trainee", number: "04", label: "練習生選擇", phaseId: "rehearsal", sceneId: "rehearsal", resumeEligible: true },
  { id: "debut", number: "05", label: "第一次出道", phaseId: "rehearsal", sceneId: "rehearsal", resumeEligible: true },
  { id: "turning-point", number: "06", label: "團隊改變", phaseId: "rehearsal", sceneId: "rehearsal", resumeEligible: true },
  { id: "restart", number: "07", label: "像重新出道", phaseId: "stage", sceneId: "stage", resumeEligible: true },
  { id: "studio", number: "08", label: "創作室", phaseId: "stage", sceneId: "stage", resumeEligible: true },
  { id: "comeback-game", number: "09", label: "回歸企劃", phaseId: "stage", sceneId: "stage", resumeEligible: true },
  { id: "music-business", number: "10", label: "一首歌的收入", phaseId: "creation", sceneId: "creation", resumeEligible: true },
  { id: "renewal", number: "11", label: "續約與改名", phaseId: "creation", sceneId: "creation", resumeEligible: true },
  { id: "takeaway", number: "12", label: "帶回自己", phaseId: "creation", sceneId: "creation", resumeEligible: true },
  { id: "sources", number: "13", label: "來源與方法", phaseId: "creation", sceneId: "creation", resumeEligible: false },
];

export const TRAINEE_SCENARIO = {
  prompt:
    "你收到海外訓練機會，但要暫停原本的學習安排、適應新語言、離開熟悉的人，而且沒有人能保證你一定出道。你會怎麼做？",
  sourceIds: ["S02", "S03", "S04"],
  choices: [
    {
      id: "go-now",
      label: "立刻前往",
      tradeoff: "你把握眼前機會，也承擔更高的適應壓力與不確定性。勇敢不代表代價消失。",
    },
    {
      id: "finish-school",
      label: "先完成目前學業",
      tradeoff: "你保留較穩定的學習路徑，但機會可能改變。延後不是懦弱，而是一種排序。",
    },
    {
      id: "trial-period",
      label: "先要求試行期",
      tradeoff: "你嘗試多取得資訊、降低一次性承諾；現實中不一定能談成，但提問本身很重要。",
    },
    {
      id: "decline",
      label: "放棄這次機會",
      tradeoff: "你選擇保護當下更重要的事。拒絕一條路，不代表永遠放棄自己的能力。",
    },
  ],
};

export const RESTART_STRATEGIES = [
  "先保留熟悉元素，降低團隊與聽眾的適應成本。",
  "保留核心，但讓新的聲音與視覺逐步進來。",
  "把舊經驗當素材，同時重新決定作品要說什麼。",
  "明顯改變方向，換取更強烈的新鮮感與辨識度。",
  "幾乎完全重來；可能打開新空間，也承擔最高的不確定性。",
];

export const TAKEAWAYS = [
  "被拒絕不一定代表沒有能力。",
  "勇敢不等於完全不害怕。",
  "創作不是一個人完成所有工作。",
  "團隊發生改變時，原本的方法未必仍適用。",
  "名字和身份可以進化。",
];
