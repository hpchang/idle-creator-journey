// Chapter-level narrative content for chapters 2–12. Each verifiable statement
// carries `sourceIds` that exist in docs/SOURCE_REGISTER.md. Pure editorial
// questions/reflections use `editorial: true` and carry no sourceIds — they must
// not be mistaken for member quotes. Shape is intentionally non-uniform so
// chapters do not read as a stamped template. See CONTENT_EXPANSION_HANDOFF.md
// §3–§4 and §8 for the rules these strings follow.

export const CHAPTER_NARRATIVES = {
  // 02 — 她們是誰
  who: {
    story: [
      {
        text: "2018 年 5 月，她們以六人團體 (G)I-DLE 出道；那是一個跨國組成的隊伍，成員來自韓國、泰國、中國與台灣。",
        sourceIds: ["S01"],
      },
      {
        text: "2021 年 8 月，Cube 宣布 Soojin 離團；從那之後，團體以五位成員活動。",
        sourceIds: ["S08"],
      },
      {
        text: "2025 年 5 月，七週年這天，她們把名字改成小寫 i-dle，對外說明這是移除原團名中的性別標示。",
        sourceIds: ["S18", "S18A"],
      },
    ],
    explanation: [
      {
        text: "三個時間點其實指向三種不同的團體狀態：出道時的六人、改變後的五人、重新命名後的 i-dle。它們不是同一張靜止的合照，而是一條會轉折的線。",
        sourceIds: ["S01", "S08", "S18"],
      },
      {
        text: "因此本站寫歷史事件時用當時的團名 (G)I-DLE，寫現況時用 i-dle。這不是前後不一致，而是讓名字貼著當時的事實走。",
        sourceIds: ["S18"],
      },
      {
        text: "團體身份會改變，但改變之間的空白，不能用傳聞補滿。可確認的就寫，不能確認的就留白，是這份檔案選擇的做法。",
        editorial: true,
      },
    ],
    reflection: {
      text: "如果一個團體的名字、人數和身份都曾經改變，你還會用「一直沒變」來理解它嗎？還是願意讓描述跟著事實一起更新？",
      editorial: true,
    },
  },

  // 03 — 五條不同的路
  paths: {
    story: [
      {
        text: "五個成員走向同一個出道舞台，但出發的位置很不一樣：有人重新遞出 demo，有人離開熟悉的語言環境，有人改變讓別人看見能力的方式，也有人從被選擇走向觀察新人。",
        sourceIds: ["S02", "S03", "S04", "S05", "S06"],
      },
      {
        text: "她們的共同點不是「都一樣努力」，而是都在不確定裡做出選擇：要不要再試一次、要不要離開熟悉的地方、要不要換一種方式被看見。",
        editorial: true,
      },
    ],
    explanation: [
      {
        text: "把五條路放在一起看，會發現「被選中」不是單一能力的比賽，而是能力、機會、資源、環境與時機共同作用的結果。",
        editorial: true,
      },
      {
        text: "同一個出道舞台背後，有跨國移動、語言適應、選秀節目、個人活動與重新爭取機會等完全不同的路徑。這些差異本身就是素材，值得被看見，而不是被平均成一個「練習生故事」。",
        sourceIds: ["S02", "S03", "S04", "S05"],
      },
    ],
    reflection: {
      text: "五條路都不一樣，卻都通向同一個舞台。你的路需要和別人相同，才算值得嗎？還是你需要的是看清楚自己現在站在哪裡？",
      editorial: true,
    },
  },

  // 04 — 練習生不是成功保證書
  trainee: {
    story: [
      {
        text: "被選進公司，不等於一定出道；出道，也不等於一定被看見。練習、被評估、被選中和正式出道，是不同階段，不是同一件事。",
        editorial: true,
      },
      {
        text: "成員的經歷就說明了這點：有人沒有收到回覆後再遞出 demo，有人在海外從語言適應開始，有人換了呈現能力的方式才逐漸找到方向。",
        sourceIds: ["S02", "S03", "S04"],
      },
    ],
    explanation: [
      {
        text: "結果會受到團隊需求、概念方向、時機、資源與合作條件影響。沒有被選中，不能直接等同沒有能力；被選中，也不代表一切從此確定。",
        editorial: true,
      },
      {
        text: "所以這份檔案不寫「只要努力就一定成功」，也不寫它的反面「沒選上就是宿命」。兩種說法都把太複雜的事簡化成一個原因。",
        editorial: true,
      },
    ],
    reflection: {
      text: "如果你盡力了卻沒有被選上，你會把它解讀成「我不夠好」，還是「這次的條件沒有對上」？這兩種解讀會帶你走向完全不同的下一步。",
      editorial: true,
    },
  },

  // 05 — 創作者不是成功後才出現
  debut: {
    story: [
      {
        text: "2018 年 5 月 2 日，她們發行 EP《I Am》與〈LATATA〉。出道這天，創作參與就已經在作品裡，不是成功之後才被允許加入。",
        sourceIds: ["S01", "S07"],
      },
      {
        text: "公開報導把 Soyeon 列為團體主要的詞曲與製作參與者；但一首歌從無到有，從來不是一個人完成的。",
        sourceIds: ["S07"],
      },
    ],
    explanation: [
      {
        text: "一首歌裡至少有演唱、作詞、作曲、編曲、舞台與視覺等不同角色。每個角色貢獻不同能力，組合起來才是一件完整作品。",
        sourceIds: ["S12", "S13", "S14", "S15"],
      },
      {
        text: "正式 credit 上出現多個名字，是專業合作的證據，不是用來削弱某位參與者的份量。共同創作者多，在流行音樂裡是常態，不是例外。",
        sourceIds: ["S12", "S13", "S14"],
      },
    ],
    reflection: {
      text: "你身邊有沒有一件事，是你以為「成功之後才有資格參與」，但其實現在就能開始動手的？創作參與的起點，往往比想像中早。",
      editorial: true,
    },
  },

  // 06 — 2021 團隊改變
  "turning-point": {
    story: [
      {
        text: "2021 年 8 月 14 日，Cube 宣布 Soojin 離團；團體此後以五人活動。這是可確認的官方結果。",
        sourceIds: ["S08"],
      },
      {
        text: "在這個結果之外，還有許多說法在流傳。本站不重述指控內容，也不把任何一方的說法寫成已被正式證明的事實。",
        editorial: true,
      },
    ],
    explanation: [
      {
        text: "面對爭議，負責任的閱讀方式不是搶著判斷誰對誰錯，而是先辨認每一句話屬於哪一種證據：有人提出說法、公司否認、官方宣布離團、正式調查或判決，各自能支持到不同的程度。",
        editorial: true,
      },
      {
        text: "「有人這樣說」不等於「事情已經證實」。公司否認也不是法院判決；官方公告可以確認團體結果，卻不能拿來當成對個案的定論。",
        editorial: true,
      },
      {
        text: "負責任的編輯會停在公開資料的界線：可確認的寫清楚，不能確認的留下空白，而不是用傳聞把空白填滿。",
        editorial: true,
      },
    ],
    reflection: {
      text: "下次看到一則關於爭議的消息，你能不能先問：這句話屬於哪一種證據？它能支持到的程度，和它宣稱的程度一樣嗎？",
      editorial: true,
    },
  },

  // 07 — 像重新出道一樣
  restart: {
    story: [
      {
        text: "2022 年 3 月 14 日，近一年的團體空窗後，她們以五人形式回歸，發行《I NEVER DIE》與主打〈TOMBOY〉。",
        sourceIds: ["S09"],
      },
      {
        text: "空窗期間，成員分別在不同地點與領域活動；受訪時，她們也談到如何看待五人重新出發的音樂身份。",
        sourceIds: ["S09", "S11"],
      },
      {
        text: "Soyeon 在 showcase 訪談中以「像重新出道一樣」形容製作這張專輯的心情。這是成員談製作心情的短引語，不是法律或合約上的出道程序。",
        sourceIds: ["S09", "S10"],
      },
    ],
    explanation: [
      {
        text: "五人回歸，不只是少了一個人這麼簡單。位置要重排、分詞要調整、舞台要重新設計，連「我們是誰」這個問題都得再回答一次。",
        editorial: true,
      },
      {
        text: "重新開始不等於把過去全部清除。她們可以同時保留累積的經驗，又重新決定作品要說什麼——〈TOMBOY〉的方向就被連結到拒絕被既定標準定義。",
        sourceIds: ["S11"],
      },
      {
        text: "危機之後，團隊可以保留熟悉感，也可以改變方向；每種選擇都伴隨不同的代價，沒有哪一條是免費的重新開始。",
        editorial: true,
      },
    ],
    reflection: {
      text: "如果你的團隊或計畫經歷了一次大改變，你會想盡量保留原本的樣子，還是趁機重新決定方向？兩種選擇各自會犧牲什麼？",
      editorial: true,
    },
  },

  // 08 — 創作室
  studio: {
    story: [
      {
        text: "讀一首歌的 credit，就像看一張工作分配表：誰寫字、誰寫旋律、誰安排聲響，都有名字可查。",
        sourceIds: ["S12", "S13", "S14"],
      },
      {
        text: "在〈TOMBOY〉、〈Nxde〉、〈Queencard〉的官方 MV credit 裡，Soyeon 都列在作詞，並參與作曲與編曲；同時 credit 也列出 Pop Time 等共同創作者。",
        sourceIds: ["S12", "S13", "S14"],
      },
    ],
    explanation: [
      {
        text: "作詞決定文字、敘事與語言節奏；作曲建立旋律與歌曲骨架；編曲安排聲響、樂器、段落與能量。三者不是同一件事，常常由不同人擔任。",
        sourceIds: ["S12", "S13", "S14"],
      },
      {
        text: "共同作曲者或編曲者多時，credit 應被讀成「這首歌由這些人一起完成」，而不是用排序去推算誰做了最多、誰權力最大、誰拿最多收入。",
        editorial: true,
      },
      {
        text: "除了 Soyeon，Minnie 與 Yuqi 也持續參與部分歌曲的詞曲或製作。self-producing 在這裡的意思是多位成員持續參與部分作品，不等於所有歌曲都由成員獨立完成。",
        sourceIds: ["S11", "S15", "S15A", "S15B"],
      },
      {
        text: "正式 credit 可以確認誰參與了什麼角色，但無法單靠排序推算完整工作量、權力、收入或所有內部決策。那些是合約與內部事，不是 credit 的工作。",
        editorial: true,
      },
    ],
    reflection: {
      text: "參與最多，等於獨自完成嗎？如果你把一首歌的成功全部歸給一個名字，會不會剛好把其他人的工作一起抹掉？",
      editorial: true,
    },
  },

  // 09 — 回歸企劃遊戲
  "comeback-game": {
    story: [
      {
        text: "這個遊戲不會給你一個唯一滿分答案，因為真實的回歸企劃也沒有。你要在有限資源裡，決定什麼最值得先被保護。",
        editorial: true,
      },
    ],
    explanation: [
      {
        text: "五項指標——概念清晰度、音樂完成度、觀眾觸及、團隊健康、長期品牌價值——會互相拉扯。把資源全押在宣傳，作品辨識度可能變薄；完全忽略休息，遇到突發事件時就少了緩衝。",
        editorial: true,
      },
      {
        text: "所以分數不是要你找最大值，而是讓你看見每一次選擇的取捨：你保住了什麼，又讓什麼承擔風險。",
        editorial: true,
      },
    ],
    reflection: {
      text: "在開始之前先想：如果只能保住一項，你會選哪一項？你願意為了它，犧牲另外四項裡的哪一些？",
      editorial: true,
    },
  },

  // 10 — 一首歌有多少種收入
  "music-business": {
    story: [
      {
        text: "要談一首歌怎麼賺錢，得先分清楚：你看到的收入屬於「錄音版本」還是「詞曲權利」？這是兩組不同的權利，常常走不同的路。",
        sourceIds: ["S19"],
      },
      {
        text: "串流、實體銷售、公開演出、授權使用，各自對應不同的權利人與分配方式，不能一概而論。",
        sourceIds: ["S19", "S20"],
      },
    ],
    explanation: [
      {
        text: "平台支付、權利人、唱片公司、發行商、出版商、集管組織，再加上個別合約——每一層都會影響最終由誰拿到多少。這裡只能說一般機制，不能套用到任何特定的人。",
        sourceIds: ["S19"],
      },
      {
        text: "Spotify 自己說明，主要串流服務不是用固定的每次播放單價直接支付藝人，而是依 streamshare 把收入分配給權利人。",
        sourceIds: ["S19"],
      },
      {
        text: "所以「播放次數 × 固定單價 = 某位成員的收入」是錯誤公式。它把好幾層權利關係壓成一個乘法，假裝知道了我們其實不知道的事。",
        sourceIds: ["S19"],
      },
      {
        text: "IFPI 的資料說，串流約占 2024 年全球錄製音樂收入的 69%。這是全球產業背景，不能直接換算成 i-dle 或任何成員的真實所得。",
        sourceIds: ["S20"],
      },
    ],
    reflection: {
      text: "下次看到「這首歌播了幾億次，所以某人賺了多少」的說法，你能不能指出它在哪一步把產業數據錯當成個人收入？",
      editorial: true,
    },
  },

  // 11 — 續約與改名
  renewal: {
    story: [
      {
        text: "2024 年 11 月 30 日，五位成員在 Melon Music Awards 舞台宣布決定與 Cube 續約，之後獲公司確認。全員續約是在 2024 年底宣布，不是 2025 年。",
        sourceIds: ["S16", "S17"],
      },
      {
        text: "2025 年 5 月 2 日，七週年這天，團體改名為小寫 i-dle。續約與改名是兩件不同的事，不是同一天、也不是同一個決定。",
        sourceIds: ["S18"],
      },
    ],
    explanation: [
      {
        text: "公開說明把改名連結到移除原團名中的性別標示，讓未來的音樂與概念不被性別定義；新識別以五個小寫 i 組成星形，象徵五位成員的連結。",
        sourceIds: ["S18", "S18A"],
      },
      {
        text: "改變名字，可能同時保留歷史並建立下一階段。但本站不臆測未公開的合約內容或公司內部動機——那些資料並不在公開範圍。",
        editorial: true,
      },
    ],
    reflection: {
      text: "改變名字是在否定過去，還是保留過去並重新決定未來？你會用哪一種方式理解一個人、一個團體改名這件事？",
      editorial: true,
    },
  },

  // 12 — 帶回自己
  takeaway: {
    story: [
      {
        text: "她們的故事可以濃縮成幾個觀察：被拒絕不一定代表沒有能力；勇敢不等於完全不害怕；創作不是一個人完成所有工作。",
        editorial: true,
      },
      {
        text: "團隊發生改變時，原本的方法未必仍適用；而名字和身份，是可以演化的。",
        editorial: true,
      },
    ],
    explanation: [
      {
        text: "這幾句話不是勵志口號，而是從可確認的經歷裡整理出來的：有人沒收到回覆後再試一次，有人在空窗後重新出道，有人在多人 credit 裡參與創作。",
        sourceIds: ["S02", "S09", "S12", "S13", "S14"],
      },
      {
        text: "能力不等於立即被選中；勇敢不等於完全不害怕；創作與改變通常依賴合作；原本方法失效時可以改變策略。",
        editorial: true,
      },
    ],
    reflection: {
      text: "回應這個網站的核心問題：創造舞台，不代表所有事情都要一個人完成。你願意開始辨認自己的能力，也練習找人合作嗎？",
      editorial: true,
    },
  },
};

// Per-member narrative depth for chapter 03. Conservative: no new biographical
// facts beyond what members.mjs already carries; these add observation/context
// and a second reflection angle, all traceable or clearly editorial.
export const MEMBER_NARRATIVES = {
  miyeon: {
    story: [
      {
        text: "Miyeon 在 KBS 訪談裡談到，第一次線上試鏡後她沒有收到最終通知；她沒有停在這裡，而是準備新的 demo 再次主動爭取。",
        sourceIds: ["S02"],
      },
    ],
    observation: {
      text: "她的經歷提醒我們：「沒有收到回覆」不等於「能力被否定」。有時候缺的是再一次讓別人看見的機會。",
      editorial: true,
    },
  },
  minnie: {
    story: [
      {
        text: "Minnie 受訪時表示，她在泰國獲得赴韓訓練機會時，原本也曾考慮留在泰國升學；母親鼓勵她冒險，初到韓國後她還要面對語言與適應。",
        sourceIds: ["S03", "S01"],
      },
    ],
    observation: {
      text: "追求機會，往往同時是離開熟悉環境的代價。她五歲開始學鋼琴，把自幼接觸音樂的基礎帶進了全新的語言與工作環境。",
      sourceIds: ["S01", "S03"],
    },
  },
  soyeon: {
    story: [
      {
        text: "媒體回顧 Soyeon 曾經歷約 20–30 次試鏡失敗，後來把 rap 加入試鏡呈現。她參加《Produce 101》《Unpretty Rapstar 3》，先以個人歌手活動，再成為團體隊長。",
        sourceIds: ["S04"],
      },
    ],
    observation: {
      text: "「約 20–30 次」是媒體報導的回顧敘述，不是公司正式紀錄。她調整的不是目標，而是讓別人看見能力的方式——並持續參與作品的詞曲與製作。",
      sourceIds: ["S04", "S07"],
    },
  },
  yuqi: {
    story: [
      {
        text: "Yuqi 出生於北京；媒體報導她在 2015 年參加 Cube 北京試鏡後赴韓成為練習生。她談到觀看 HyunA 舞台後產生 K-pop 志向，把興趣轉成跨國移動與長期訓練。",
        sourceIds: ["S05", "S01"],
      },
    ],
    observation: {
      text: "興趣在什麼條件下會變成目標？她的版本是：當你願意為它離開熟悉的地方、投入長期訓練，而不只是欣賞。本站不使用未經第一手確認的試鏡歌曲細節。",
      editorial: true,
    },
  },
  shuhua: {
    story: [
      {
        text: "Shuhua 是團體跨國組成中的台灣成員，也是 2018 年隨團出道的初始成員之一。關於更早的經歷，公開資料相對有限。",
        sourceIds: ["S01"],
      },
      {
        text: "她後來在官方節目中擔任一日 casting manager，從被選擇者的視角，換到觀察新人的位置。",
        sourceIds: ["S06"],
      },
    ],
    observation: {
      text: "公開資料對她精確練習生年限的說法互相矛盾，因此本站不採用。資料不足時，「目前不知道」是負責任的答案，比用傳聞填滿空白更誠實。",
      editorial: true,
    },
  },
};