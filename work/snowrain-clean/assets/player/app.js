(() => {
  const SAVE_KEY = "snowrain.clean.save.v4";

  const range = (from, to) => {
    const list = [];
    for (let i = from; i <= to; i += 1) list.push(String(i));
    return list;
  };

  const STORY_FLOWS = [
    { id: "common", title: "공통 루트", scripts: range(1, 73), next: "route-select" },
    { id: "interlude", title: "공통 이벤트", scripts: ["97", "98", "99"], next: "route-select" },
    { id: "dahae", title: "다혜 루트", heroine: 0, scripts: range(100, 143), after: "1" },
    { id: "mina", title: "미나 루트", heroine: 1, scripts: range(200, 243), after: "2" },
    { id: "ahra", title: "아라 루트", heroine: 2, scripts: range(300, 343), after: "3" },
    { id: "sohi", title: "소희 루트", heroine: 3, scripts: range(400, 431) },
    { id: "yuna", title: "윤아 루트", heroine: 4, scripts: range(500, 531) }
  ];

  const EXTRA_SETS = [
    { id: "after", title: "AFTER STORY", dir: "after" },
    { id: "dateintro", title: "DATE INTRO", dir: "dateintro" },
    { id: "datetxt", title: "DATE", dir: "datetxt" },
    { id: "dateoverlaptxt", title: "DATE OVERLAP", dir: "dateoverlaptxt" },
    { id: "lovetxt", title: "LOVE MODE", dir: "lovetxt" },
    { id: "normaltxt", title: "NORMAL ENDING", dir: "normaltxt" },
    { id: "badscript", title: "BAD ENDING", dir: "badscript" },
    { id: "calldatetxt", title: "CALL DATE", dir: "calldatetxt" },
    { id: "request", title: "CALL REQUEST", dir: "request" },
    { id: "return", title: "RETURN", dir: "return" },
    { id: "stateeventtxt", title: "STATE EVENT", dir: "stateeventtxt" }
  ];

  const HEROINE_NAMES = ["다혜", "미나", "아라", "소희", "윤아"];
  const HEROINE_ROUTE_IDS = ["dahae", "mina", "ahra", "sohi", "yuna"];
  const STAT_NAMES = {
    study: "공부",
    exercise: "운동",
    sense: "센스",
    charm: "매력"
  };
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  const ROUTE_RULES = {
    dahae: { heroine: 0, minAffection: 24, stats: { charm: 10, sense: 8 } },
    mina: { heroine: 1, minAffection: 24, stats: { exercise: 12, sense: 6 } },
    ahra: { heroine: 2, minAffection: 20, stats: { charm: 8, study: 6 } },
    sohi: { heroine: 3, minAffection: 18, stats: { sense: 12, study: 8 } },
    yuna: { heroine: 4, minAffection: 18, stats: { study: 14, sense: 8 } }
  };

  const ROUTE_STAT_WEIGHTS = {
    dahae: ["charm", "sense"],
    mina: ["exercise", "sense"],
    ahra: ["charm", "study"],
    sohi: ["sense", "study"],
    yuna: ["study", "sense"]
  };

  const WEEK_ACTIONS = [
    { id: "study", label: "공부", meta: "공부 +4 / 센스 +1", stats: { study: 4, sense: 1 }, money: -20 },
    { id: "exercise", label: "운동", meta: "운동 +4 / 매력 +1", stats: { exercise: 4, charm: 1 }, money: -10 },
    { id: "sense", label: "감성", meta: "센스 +4 / 매력 +1", stats: { sense: 4, charm: 1 }, money: -15 },
    { id: "charm", label: "꾸미기", meta: "매력 +4 / 센스 +1", stats: { charm: 4, sense: 1 }, money: -30 },
    { id: "work", label: "아르바이트", meta: "돈 +120 / 피로 누적", stats: { exercise: 1 }, money: 120, fatigue: 8 }
  ];

  const ORIGINAL_TABLES = {
    fDate: [1, 1, 1, 0, 0, 2, 2, 2, 0, 0, 1, 1, 1, 0, 0, 2, 2, 2, 0, 0, 1, 1, 1, 0, 0, 3, 3, 3, 0, 0, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1],
    datePlace: [5, 8, 6, 7, 9, 10, 3, 2, 5, 8, 6, 4, 7, 1, 0, 2, 5, 8, 0, 4, 1, 9, 10, 3, 8, 6, 7, 1, 9, 10, 3, 2, 5, 6, 4, 7, 9, 10, 0, 2]
  };

  const ROOT_MARKERS = {
    "-2": "평일 행동",
    "-3": "데이트"
  };

  const ORIGINAL_ROOTS = {
    dahae: [100, -2, 101, -3, 102, -2, 103, 104, 105, -2, 106, -3, 107, -2, 108, -3, 109, -2, 110, -3, 111, -2, 112, -3, 113, -2, 114, 115, 116, -2, 117, -3, 118, -2, 119, -3, 120, -2, 121, -3, 122, -2, 123, -3, 124, -2, 125, -3, 126, -2, 127, -3, 128, -2, 129, -3, 130, -2, 131, 132, 133, -2, 134, -3, 135, -2, 136, -3, 137, -2, 138, -3, 139, -2, 140, -3, 141, -2, 142, -3, 143],
    mina: [200, -2, 201, -3, 202, -2, 203, 204, 205, -2, 206, -3, 207, -2, 208, -3, 209, -2, 210, -3, 211, -2, 212, -3, 213, -2, 214, 215, 216, -2, 217, -3, 218, -2, 219, -3, 220, -2, 221, -3, 222, -2, 223, -3, 224, -2, 225, -3, 226, -2, 227, -3, 228, -2, 229, -3, 230, -2, 231, 232, 233, -2, 234, -3, 235, -2, 236, -3, 237, -2, 238, -3, 239, -2, 240, -3, 241, -2, 242, -3, 243],
    ahra: [300, -2, 301, -3, 302, -2, 303, 304, 305, -2, 306, -3, 307, -2, 308, -3, 309, -2, 310, -3, 311, -2, 312, -3, 313, -2, 314, 315, 316, -2, 317, -3, 318, -2, 319, -3, 320, -2, 321, -3, 322, -2, 323, -3, 324, -2, 325, -3, 326, -2, 327, -3, 328, -2, 329, -3, 330, -2, 331, 332, 333, -2, 334, -3, 335, -2, 336, -3, 337, -2, 338, -3, 339, -2, 340, -3, 341, -2, 342, -3, 343],
    sohi: [400, -2, 401, -3, 402, -2, 403, 404, 405, -2, 406, -3, 407, -2, 408, -3, 409, -2, 410, -3, 411, -2, 412, -3, 413, -2, 414, -3, 415, -2, 416, -3, 417, -2, 418, -3, 419, -2, 420, -3, 421, -2, 422, -3, 423, -2, 424, -3, 425, -2, 426, -3, 427, -2, 428, -3, 429, -2, 430, 431],
    yuna: [500, -2, 501, -3, 502, -2, 503, 504, 505, -2, 506, -3, 507, -2, 508, -3, 509, -2, 510, -3, 511, -2, 512, -3, 513, -2, 514, -3, 515, -2, 516, -3, 517, -2, 518, -3, 519, -2, 520, -3, 521, -2, 522, -3, 523, -2, 524, -3, 525, -2, 526, -3, 527, -2, 528, -3, 529, -2, 530, 531]
  };

  const DATE_TABLES = {
    common: [[1, 1, 1, 0, 0], [2, 2, 2, 0, 0], [1, 1, 1, 0, 0], [2, 2, 2, 0, 0], [1, 1, 1, 0, 0], [3, 3, 3, 0, 0], [2, 2, 2, 5, 5], [1, 1, 1, 1, 1]],
    main: [[1, 1, 1, 1, 1], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [3, 3, 3, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11], [2, 2, 2, 11, 11]],
    sub: [[9, 9, 10, 6, 6], [9, 9, 10, 6, 6], [9, 9, 10, 7, 7], [9, 9, 10, 7, 7], [9, 9, 10, 8, 8], [9, 9, 10, 8, 8], [9, 9, 10, 8, 8], [9, 9, 10, 8, 8], [9, 9, 10, 9, 9], [9, 9, 10, 9, 9], [9, 9, 10, 9, 9], [1, 1, 1, 1, 1], [9, 9, 10, 10, 10], [9, 9, 10, 10, 10], [9, 9, 10, 10, 10], [9, 9, 10, 10, 10]],
    dahae: [[3, 3, 2, 12, 12], [1, 1, 1, 1, 1], [5, 11, 2, 12, 12], [6, 11, 2, 12, 12], [7, 11, 2, 12, 12], [8, 11, 3, 12, 12], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [3, 9, 9, 12, 12], [2, 9, 9, 13, 12], [1, 9, 9, 13, 12], [2, 9, 9, 13, 12], [2, 9, 9, 13, 12], [2, 9, 9, 13, 12], [2, 9, 9, 13, 12], [2, 9, 9, 13, 12]],
    mina: [[3, 3, 2, 12, 12], [1, 1, 1, 1, 1], [11, 5, 2, 12, 12], [11, 6, 2, 12, 12], [11, 7, 2, 12, 12], [11, 8, 3, 12, 12], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [9, 2, 9, 12, 12], [9, 2, 9, 13, 12], [9, 1, 9, 13, 12], [9, 2, 9, 13, 12], [9, 3, 9, 13, 12], [9, 2, 9, 13, 12], [9, 11, 9, 13, 12], [9, 11, 9, 13, 12]],
    ahra: [[3, 3, 2, 12, 12], [1, 1, 1, 1, 1], [10, 10, 2, 12, 12], [10, 10, 2, 12, 12], [10, 10, 2, 12, 12], [10, 10, 3, 12, 12], [1, 1, 1, 1, 1], [2, 2, 5, 12, 12], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [9, 9, 6, 12, 12], [9, 9, 2, 13, 12], [9, 9, 1, 13, 12], [9, 9, 7, 13, 12], [9, 9, 2, 13, 12], [9, 9, 3, 13, 12], [9, 9, 2, 13, 12], [9, 9, 8, 13, 12]],
    sohi: [[10, 10, 10, 3, 12], [1, 1, 1, 1, 1], [10, 10, 10, 2, 12], [10, 10, 10, 2, 12], [10, 10, 10, 2, 12], [1, 1, 1, 1, 1], [10, 10, 10, 2, 12], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [10, 10, 10, 2, 12], [10, 10, 10, 3, 12], [10, 10, 10, 2, 12], [10, 10, 10, 2, 12], [1, 1, 1, 1, 1]],
    yuna: [[10, 10, 10, 12, 3], [1, 1, 1, 1, 1], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [10, 10, 10, 12, 2], [10, 10, 10, 12, 2], [10, 10, 10, 12, 13], [10, 10, 10, 13, 3], [1, 1, 1, 1, 1]]
  };

  const DATE_PLACE_TABLE = [[5, 8, 6, 7, 9], [10, 3, 2, 5, 8], [6, 4, 7, 1, 0], [2, 5, 8, 0, 4], [1, 9, 10, 3, 8], [6, 7, 1, 9, 10], [3, 2, 5, 6, 4], [7, 9, 10, 0, 2]];
  const DATE_PLACE_NAMES = ["집", "학교", "카페", "쇼핑가", "영화관", "공원", "바다", "도서관", "번화가", "레스토랑", "수족관", "루브르", "이벤트", "고백"];
  const SCENE_LABELS = {
    1: "\uc9d1",
    2: "\ud559\uad50",
    3: "\uce74\ud398",
    4: "\uc1fc\ud551\uac00",
    5: "\uacf5\uc6d0",
    6: "\ubc29",
    8: "\ub3c4\uc11c\uad00",
    9: "\ubc88\ud654\uac00",
    10: "\ub808\uc2a4\ud1a0\ub791",
    20: "\ud574\ubcc0\uac00",
    21: "\ud574\ubcc0\uac00",
    22: "\ud574\ubcc0\uac00",
    23: "\uc218\uc871\uad00",
    24: "\uacf5\uc6d0",
    26: "\ubc88\ud654\uac00",
    27: "\uce74\ud398",
    28: "\ubc88\ud654\uac00",
    29: "\uce74\ud398",
    30: "\ub808\uc2a4\ud1a0\ub791",
    31: "\ub3c4\uc11c\uad00",
    32: "\ud559\uad50"
  };

  const ENDING_RULES = {
    dahae: { heroine: 0, minAffection: 70, minDates: 4, stats: { charm: 55, sense: 55 }, normal: "01", bad: "254", after: "1" },
    mina: { heroine: 1, minAffection: 70, minDates: 3, stats: { exercise: 55, sense: 55 }, normal: "02", bad: "254", after: "2" },
    ahra: { heroine: 2, minAffection: 70, minDates: 3, stats: { charm: 55, study: 55 }, normal: "03", bad: "254", after: "3" },
    sohi: { heroine: 3, minAffection: 70, minDates: 3, stats: { sense: 55, study: 55 }, normal: "03", bad: "255" },
    yuna: { heroine: 4, minAffection: 70, minDates: 3, stats: { study: 55, sense: 55 }, normal: "03", bad: "255" }
  };

  const CONFESSION_RULES = {
    dahae: { minAffection: 55, minDates: 3, minProgress: 0.72 },
    mina: { minAffection: 55, minDates: 3, minProgress: 0.72 },
    ahra: { minAffection: 55, minDates: 2, minProgress: 0.72 },
    sohi: { minAffection: 55, minDates: 2, minProgress: 0.68 },
    yuna: { minAffection: 55, minDates: 2, minProgress: 0.68 }
  };

  const ENDING_OPEN_IDS = {
    dahae: { good: 0, normal: 1 },
    mina: { good: 2, normal: 3 },
    ahra: { good: 4, normal: 5 },
    sohi: { good: 6, normal: 6 },
    yuna: { good: 7, normal: 7 }
  };

  const AFTER_STORY_RULES = {
    dahae: { after: "1", endingId: 0, minDates: 4 },
    mina: { after: "2", endingId: 2, minDates: 3 },
    ahra: { after: "3", endingId: 4, minDates: 3 }
  };

  const STATE_EVENT_STAT_KEYS = ["study", "exercise", "sense", "charm"];
  const STATE_EVENT_THRESHOLDS = [55, 70, 90];
  const STATE_EVENT_DAY_SLOTS = {
    "5/2": 1,
    "5/3": 2,
    "6/3": 3,
    "6/4": 4,
    "7/1": 5,
    "7/2": 6,
    "8/2": 7,
    "8/3": 8,
    "10/4": 9,
    "11/3": 10,
    "11/4": 11,
    "12/1": 12,
    "12/2": 13,
    "12/4": 14,
    "1/1": 15
  };
  const STATE_EVENT_DATE_TABLE = [
    [[1, 5, 12], [3, 7, 14], [2, 6, 13], [4, 8, 15]],
    [[1, 5, 12], [2, 6, 13], [3, 7, 14], [4, 8, 15]],
    [[4, 8, 15], [1, 5, 12], [3, 7, 14], [2, 6, 13]],
    [[3, 7, 12], [4, 8, 13], [1, 5, 10], [2, 6, 11]],
    [[1, 5, 9], [4, 8, 13], [2, 6, 11], [3, 7, 12]]
  ];

  const SPEAKERS = {
    0: "다혜",
    1: "미나",
    2: "아라",
    3: "소희",
    4: "윤아",
    5: "지훈",
    6: "태균",
    7: "사장님",
    8: "친구",
    9: "손님",
    10: "승훈",
    13: "남학생",
    14: "의사",
    18: "만복",
    22: "아버지",
    255: "대화"
  };

  const HEROINE_SPRITES = new Set([0, 1, 2, 3, 4, 6, 7, 8, 9, 10]);
  const VISUAL_MEDIA_DIRS = ["Illuster", "MiniIlluster", "Comic", "Cartoon"];
  const CHARACTER_COMMANDS = new Set([0x05, 0x08]);
  const TRANSITION_COMMANDS = new Set([0xf9, 0xfa, 0xfb, 0xfc, 0xfd]);
  const CG_TRANSITION_COMMANDS = new Set([0xfa, 0xfc, 0xfd]);
  const BGM_MAX_ID = 19;
  const SPEAKER_CHARACTER_FALLBACK = {
    0: 0,
    1: 2,
    2: 4,
    3: 6,
    4: 10
  };
  const LOVE_MENU_RESULTS = {
    0x02: { id: "good", label: "\uc88b\uc74c", affection: 2 },
    0x01: { id: "normal", label: "\ubcf4\ud1b5", affection: 1 },
    0xff: { id: "bad", label: "\ub098\uc068", affection: -1 },
    0x00: { id: "skip", label: "\ubcf4\ub958", affection: 0 }
  };
  const LOVE_DRINK_NAMES = {
    1: "\ube14\ub799\ucee4\ud53c",
    2: "\uc544\uba54\ub9ac\uce74\ub178",
    3: "\uce74\ud398\ub77c\ub5bc",
    4: "\uce74\ub77c\uba5c \ub9c8\ud0a4\uc544\ub610",
    5: "\ucf54\ucf54\uc544",
    6: "\uc7c8\uc2a4\ubbfc \ud2f0",
    7: "\ud398\ud37c\ubbfc\ud2b8 \ud2f0",
    8: "\ud1a0\ub9c8\ud1a0 \uc8fc\uc2a4",
    9: "\ubc14\ub098\ub098 \uc8fc\uc2a4",
    10: "\ud56b\ucd78\ucf54"
  };
  const LOVE_CAKE_NAMES = {
    1: "\uce58\uc988 \ucf00\uc774\ud06c",
    2: "\uc640\ud50c",
    3: "\uace0\uad6c\ub9c8\ucf00\uc774\ud06c",
    4: "\ucd08\ucf54 \ud2f0\ub77c\ubbf8\uc2a4 \ucf00\uc774\ud06c",
    5: "\uc0cc\ub4dc\uc704\uce58"
  };
  const LOVE_MENU_GROUPS = [
    { drink: [[3, 4], [5, 6, 7, 8, 9, 10], [1, 2]], cake: [[4], [2, 3, 5], [1]] },
    { drink: [[1, 2], [5, 3, 4, 8, 9, 10], [6, 7]], cake: [[1], [3, 4, 5], [2]] },
    { drink: [[8, 9], [1, 2, 5, 6, 7, 10], [3, 4]], cake: [[5], [1, 2, 3], [4]] },
    { drink: [[6, 7], [1, 2, 3, 4, 8, 9], [5, 10]], cake: [[2], [1, 4, 5], [3]] },
    { drink: [[5, 10], [1, 2, 3, 4, 6, 7], [8, 9]], cake: [[3], [1, 2, 4], [5]] }
  ];
  const LOVE_MENU_ICONS = {
    coffee: "gimage/86.png",
    drink: "gimage/88.png",
    cake: "gimage/89.png"
  };
  function createDefaultGameState() {
    return {
      day: 0,
      month: 3,
      date: 1,
      weekday: 1,
      money: 300,
      fatigue: 0,
      stats: {
        study: 5,
        exercise: 5,
        sense: 5,
        charm: 5
      },
      affection: [8, 8, 5, 4, 4],
      routePoints: [0, 0, 0, 0, 0],
      dateCount: [0, 0, 0, 0, 0],
      flags: {},
      seenStateEvents: [],
      unlockedAfter: [],
      unlockedEndings: [],
      unlockedGallery: [],
      loveMenuResults: [],
      clearedRoutes: [],
      confession: {},
      completedScripts: [],
      chosenRoute: null,
      lockedRoute: null,
      rootCursor: 0,
      pendingRootMarker: null,
      lastDatePlace: null,
      lastLoveNum: null,
      lastAction: "새 게임",
      routeJudgement: null
    };
  }

  const state = {
    manifest: null,
    screen: "title",
    sourceDir: "Scripttxt",
    scriptName: "1",
    flowId: "common",
    flowIndex: 0,
    routeId: null,
    returnTarget: null,
    events: [],
    eventIndex: 0,
    scriptChoicePath: [],
    visibleText: "",
    fullText: "",
    typing: null,
    auto: false,
    menuOpen: false,
    choiceOpen: false,
    backgrounds: [],
    illust: [],
    cgPaths: [],
    soundPaths: [],
    backgroundSet: new Set(),
    mediaIndex: new Map(),
    characterMap: {},
    scriptSet: new Set(),
    fileIndex: new Map(),
    loveModeTable: {},
    currentBgm: null,
    pendingBgm: null,
    spriteCache: new Map(),
    spriteRenderToken: 0,
    characterAnchors: {},
    scriptTrace: [],
    debugAnchors: false,
    audioUnlocked: false,
    bgmAudio: null,
    game: createDefaultGameState()
  };

  const $ = (id) => document.getElementById(id);
  const nodes = {
    app: $("app"),
    titleScreen: $("titleScreen"),
    gameScreen: $("gameScreen"),
    browserScreen: $("browserScreen"),
    titleBg: $("titleBg"),
    titleLogo: $("titleLogo"),
    backdrop: $("backdrop"),
    cgLayer: $("cgLayer"),
    characterSprite: $("characterSprite"),
    sceneLabel: $("sceneLabel"),
    weekLabel: $("weekLabel"),
    speakerName: $("speakerName"),
    lineCounter: $("lineCounter"),
    dialogue: $("dialogue"),
    centerMenu: $("centerMenu"),
    choiceLayer: $("choiceLayer"),
    choiceTitle: $("choiceTitle"),
    choiceList: $("choiceList"),
    autoBtn: $("autoBtn"),
    dateLabel: $("dateLabel"),
    moneyLabel: $("moneyLabel"),
    routeLabel: $("routeLabel"),
    statGrid: $("statGrid"),
    affectionGrid: $("affectionGrid"),
    browserTitle: $("browserTitle"),
    chapterList: $("chapterList"),
    galleryGrid: $("galleryGrid")
  };

  Object.assign(nodes, {
    anchorDebug: $("anchorDebug"),
    anchorDebugMeta: $("anchorDebugMeta"),
    anchorTrace: $("anchorTrace"),
    anchorCloseBtn: $("anchorCloseBtn"),
    faceXInput: $("faceXInput"),
    faceYInput: $("faceYInput"),
    eyeXInput: $("eyeXInput"),
    eyeYInput: $("eyeYInput"),
    anchorApplyBtn: $("anchorApplyBtn"),
    anchorCopyBtn: $("anchorCopyBtn"),
    anchorDownloadBtn: $("anchorDownloadBtn")
  });

  function asset(path) {
    return `../game/${path}`;
  }

  function sortNumeric(paths) {
    return [...paths].sort((a, b) => {
      const aa = Number(String(a).match(/(\d+)/)?.[1] || Number.MAX_SAFE_INTEGER);
      const bb = Number(String(b).match(/(\d+)/)?.[1] || Number.MAX_SAFE_INTEGER);
      if (aa !== bb) return aa - bb;
      return String(a).localeCompare(String(b), "ko");
    });
  }

  function availableScripts(scripts) {
    return scripts.filter((name) => state.scriptSet.has(String(name)));
  }

  function flowById(id) {
    return STORY_FLOWS.find((flow) => flow.id === id) || null;
  }

  function activeFlow() {
    return flowById(state.flowId);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  function copyGameState(game) {
    const base = createDefaultGameState();
    if (!game || typeof game !== "object") return base;
    return {
      ...base,
      ...game,
      stats: { ...base.stats, ...(game.stats || {}) },
      affection: HEROINE_NAMES.map((_, i) => clamp(Number(game.affection?.[i] ?? base.affection[i]))),
      routePoints: HEROINE_NAMES.map((_, i) => clamp(Number(game.routePoints?.[i] ?? base.routePoints[i]), 0, 999)),
      dateCount: HEROINE_NAMES.map((_, i) => Math.max(0, Number(game.dateCount?.[i] ?? base.dateCount[i]) || 0)),
      flags: { ...base.flags, ...(game.flags || {}) },
      seenStateEvents: Array.isArray(game.seenStateEvents) ? [...new Set(game.seenStateEvents)] : [],
      unlockedAfter: Array.isArray(game.unlockedAfter) ? [...new Set(game.unlockedAfter)] : [],
      unlockedEndings: Array.isArray(game.unlockedEndings) ? [...new Set(game.unlockedEndings)] : [],
      unlockedGallery: Array.isArray(game.unlockedGallery) ? [...new Set(game.unlockedGallery)] : [],
      loveMenuResults: Array.isArray(game.loveMenuResults) ? game.loveMenuResults.map((item) => ({ ...item })) : [],
      clearedRoutes: Array.isArray(game.clearedRoutes) ? [...new Set(game.clearedRoutes)] : [],
      confession: { ...base.confession, ...(game.confession || {}) },
      rootCursor: Math.max(0, Number(game.rootCursor ?? base.rootCursor) || 0),
      pendingRootMarker: game.pendingRootMarker ?? null,
      lastDatePlace: game.lastDatePlace ?? null,
      lastLoveNum: game.lastLoveNum ?? null,
      completedScripts: Array.isArray(game.completedScripts) ? [...new Set(game.completedScripts)] : []
    };
  }

  function resetGameState() {
    state.game = createDefaultGameState();
  }

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      sourceDir: state.sourceDir,
      scriptName: state.scriptName,
      flowId: state.flowId,
      flowIndex: state.flowIndex,
      routeId: state.routeId,
      returnTarget: state.returnTarget,
      eventIndex: state.eventIndex,
      choicePath: state.scriptChoicePath,
      game: state.game,
      savedAt: Date.now()
    }));
  }

  function loadSave() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    } catch (_) {
      return null;
    }
  }

  function formatDate(game = state.game) {
    return `${game.month}/${game.date} ${WEEKDAYS[game.weekday]}`;
  }

  function formatOriginalDate(game = state.game) {
    const month = Math.max(1, Number(game.month) || 1);
    const week = Math.max(1, Math.ceil((Math.max(1, Number(game.date) || 1)) / 7));
    return `${month}\uc6d4${week}\uc9f8\uc8fc`;
  }

  function weekModeLabel(game = state.game) {
    return game.weekday === 0 || game.weekday === 6 ? "\uc8fc\ub9d0" : "\uc8fc\uc911";
  }

  function statClass(value) {
    if (value >= 80) return "S";
    if (value >= 60) return "A";
    if (value >= 40) return "B";
    if (value >= 22) return "C";
    return "D";
  }

  function routeScore(routeId) {
    const rule = ROUTE_RULES[routeId];
    const heroine = rule.heroine;
    const stats = ROUTE_STAT_WEIGHTS[routeId] || [];
    const statScore = stats.reduce((sum, key) => sum + (state.game.stats[key] || 0), 0);
    return Math.round((state.game.affection[heroine] * 2) + statScore + (state.game.routePoints[heroine] * 3));
  }

  function routeCandidate(routeId) {
    const flow = flowById(routeId);
    const rule = ROUTE_RULES[routeId];
    const statsOk = Object.entries(rule.stats).every(([key, value]) => (state.game.stats[key] || 0) >= value);
    const affectionOk = state.game.affection[rule.heroine] >= rule.minAffection;
    return {
      id: routeId,
      title: flow.title,
      heroine: rule.heroine,
      score: routeScore(routeId),
      available: statsOk && affectionOk,
      missing: [
        affectionOk ? "" : `호감 ${rule.minAffection}`,
        ...Object.entries(rule.stats)
          .filter(([key, value]) => (state.game.stats[key] || 0) < value)
          .map(([key, value]) => `${STAT_NAMES[key]} ${value}`)
      ].filter(Boolean)
    };
  }

  function judgeRoutes() {
    const candidates = HEROINE_ROUTE_IDS
      .map(routeCandidate)
      .sort((a, b) => Number(b.available) - Number(a.available) || b.score - a.score);
    state.game.routeJudgement = candidates.map(({ id, score, available, missing }) => ({ id, score, available, missing }));
    return candidates;
  }

  function bestRoute() {
    return judgeRoutes()[0] || null;
  }

  function hasFile(dir, name) {
    return (state.fileIndex.get(dir) || []).includes(String(name));
  }

  function numericStem(path) {
    const file = String(path).split("/").pop() || "";
    const match = file.match(/^(\d+)/);
    return match ? Number(match[1]) : null;
  }

  function mediaPathFor(dir, id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId < 0 || numericId === 0xff) return null;
    return (state.mediaIndex.get(dir) || []).find((path) => numericStem(path) === numericId) || null;
  }

  function backgroundPathForId(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId < 0 || numericId === 0xff) return null;
    return state.backgrounds.find((path) => numericStem(path) === numericId) || null;
  }

  function soundPathFor(id) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId < 0 || numericId === 0xff) return null;
    return state.soundPaths.find((path) => numericStem(path) === numericId) || null;
  }

  function hasCharacter(id) {
    const key = String(id);
    return Boolean(Array.isArray(state.characterMap[key]) && state.characterMap[key].length);
  }

  function fallbackCharacterForSpeaker(code) {
    if (!Number.isFinite(code)) return null;
    if (code === 5 || code === 255) return null;
    const mapped = SPEAKER_CHARACTER_FALLBACK[code];
    if (mapped !== undefined && hasCharacter(mapped)) return mapped;
    return hasCharacter(code) ? code : null;
  }

  function characterImageFor(id, variant = 1) {
    const key = String(id);
    const files = state.characterMap[key] || [];
    const numericVariant = Number(variant);
    const normalized = Number.isFinite(numericVariant) && numericVariant > 0 ? numericVariant : 1;
    const exact = `${normalized}.png`;
    const file = files.includes(exact)
      ? exact
      : files.find((name) => numericStem(name) === normalized) || files.find((name) => numericStem(name) === 1) || files[0];
    if (!file) return null;
    return `character/${key}/Cloth/${file}`;
  }

  function characterFacePathFor(id, expression = 2) {
    const key = String(id);
    const numericExpression = Number(expression);
    const normalized = Number.isFinite(numericExpression) && numericExpression > 0 ? numericExpression : 2;
    return `character/face/${key}/${normalized}.png`;
  }

  function characterFaceCandidatesFor(id, expression = 2) {
    const key = String(id);
    const numericExpression = Number(expression);
    const normalized = Number.isFinite(numericExpression) && numericExpression > 0 ? numericExpression : 2;
    const choices = [normalized, 2, 1, 3, 4].filter((value, index, list) => list.indexOf(value) === index);
    return choices.map((value) => `character/face/${key}/${value}.png`);
  }

  function characterEyePathFor(eye = null) {
    const numericEye = Number(eye);
    if (!Number.isFinite(numericEye) || numericEye <= 0) return null;
    return `character/eye/${numericEye}.png`;
  }

  function characterAnchorKey(id) {
    return `character_${id}`;
  }

  function defaultCharacterAnchor(id) {
    const body = characterImageFor(id, 1);
    const files = state.characterMap[String(id)] || [];
    const widthHint = id === 0 ? 300 : id === 2 ? 202 : id === 4 ? 188 : id === 6 ? 136 : id === 10 ? 160 : 240;
    return {
      body: { x: 0, y: 0 },
      face: { x: Math.max(0, Math.round((widthHint - 76) / 2)), y: 0 },
      eye: { x: Math.max(0, Math.round((widthHint - 76) / 2) + 8), y: 24 },
      drawOrder: ["body", "face", "eye"],
      source: body && files.length ? "fallback" : "fallback"
    };
  }

  function characterAnchorFor(id) {
    const key = characterAnchorKey(id);
    const base = state.characterAnchors[key] || defaultCharacterAnchor(id);
    return {
      body: { x: Number(base.body?.x || 0), y: Number(base.body?.y || 0) },
      face: { x: Number(base.face?.x || 0), y: Number(base.face?.y || 0) },
      eye: { x: Number(base.eye?.x || 0), y: Number(base.eye?.y || 0) },
      drawOrder: Array.isArray(base.drawOrder) && base.drawOrder.length ? base.drawOrder : ["body", "face", "eye"]
    };
  }

  function setCharacterAnchor(id, patch) {
    const key = characterAnchorKey(id);
    const current = characterAnchorFor(id);
    state.characterAnchors[key] = {
      ...current,
      ...patch,
      body: { ...current.body, ...(patch.body || {}) },
      face: { ...current.face, ...(patch.face || {}) },
      eye: { ...current.eye, ...(patch.eye || {}) },
      drawOrder: patch.drawOrder || current.drawOrder
    };
    state.spriteCache.clear();
    try {
      localStorage.setItem("snowrain.characterAnchors", JSON.stringify(state.characterAnchors, null, 2));
    } catch (_) {
      // localStorage can be unavailable in restricted previews.
    }
  }

  function primaryHeroineCharacterId() {
    const routeHeroine = routeHeroineIndex(state.routeId || state.flowId);
    if (routeHeroine >= 0) return SPEAKER_CHARACTER_FALLBACK[routeHeroine] ?? null;
    const scriptNum = Number(String(state.scriptName).match(/\d+/)?.[0] || 0);
    const heroine = heroineFromLoveNum(scriptNum);
    if (Number.isInteger(heroine)) return SPEAKER_CHARACTER_FALLBACK[heroine] ?? null;
    return null;
  }

  function unlockGallery(path) {
    if (!path) return;
    addUnique(state.game.unlockedGallery, path);
    state.game.flags[`gallery:${path}`] = true;
  }

  function addUnique(list, value) {
    if (!list.includes(value)) list.push(value);
  }

  function conditionStatus(routeId, rules) {
    const rule = rules?.[routeId];
    const heroine = routeHeroineIndex(routeId);
    if (!rule || heroine < 0) return { ok: false, missing: ["조건표 없음"] };
    const missing = [];
    if ((state.game.affection[heroine] || 0) < rule.minAffection) missing.push(`호감 ${rule.minAffection}`);
    if ((state.game.dateCount[heroine] || 0) < rule.minDates) missing.push(`데이트 ${rule.minDates}`);
    Object.entries(rule.stats || {}).forEach(([key, value]) => {
      if ((state.game.stats[key] || 0) < value) missing.push(`${STAT_NAMES[key]} ${value}`);
    });
    if (rule.minProgress && routeProgress(routeId) < rule.minProgress) missing.push(`진행 ${Math.round(rule.minProgress * 100)}%`);
    return { ok: missing.length === 0, missing, rule, heroine };
  }

  function routeProgress(routeId = state.flowId) {
    const flow = flowById(routeId);
    const scripts = scriptSequenceForFlow(flow);
    if (!scripts.length) return 0;
    return Math.max(0, Math.min(1, (state.flowIndex + 1) / scripts.length));
  }

  function isAfterUnlocked(flow) {
    return Boolean(flow?.after && state.game.unlockedAfter.includes(flow.after));
  }

  function endingOpenId(routeId, kind) {
    return ENDING_OPEN_IDS[routeId]?.[kind] ?? null;
  }

  function checkAfterStoryOpenOriginal(routeId, kind) {
    const rule = AFTER_STORY_RULES[routeId];
    const heroine = routeHeroineIndex(routeId);
    return Boolean(
      rule &&
      kind === "good" &&
      heroine >= 0 &&
      (state.game.dateCount[heroine] || 0) >= rule.minDates &&
      endingOpenId(routeId, kind) === rule.endingId
    );
  }

  function markEnding(routeId, kind) {
    const flow = flowById(routeId);
    const openId = endingOpenId(routeId, kind);
    const key = `${routeId}:${kind}:${openId ?? "-"}`;
    addUnique(state.game.unlockedEndings, key);
    if (kind === "good") {
      addUnique(state.game.clearedRoutes, routeId);
      if (flow?.after && checkAfterStoryOpenOriginal(routeId, kind)) addUnique(state.game.unlockedAfter, flow.after);
    }
    state.game.flags[`ending:${key}`] = true;
    if (openId !== null) state.game.flags[`openEnding:${openId}`] = true;
    state.game.lastAction = kind === "good" ? "굿 엔딩 해금" : kind === "normal" ? "노멀 엔딩" : "배드 엔딩";
    renderGameState();
    save();
  }

  function resolveEnding(routeId) {
    const status = conditionStatus(routeId, ENDING_RULES);
    const confessionOk = Boolean(state.game.confession?.[routeId]);
    if (status.ok && confessionOk) return { routeId, kind: "good", status };
    if (status.missing.length <= 2 || confessionOk) return { routeId, kind: "normal", status };
    return { routeId, kind: "bad", status };
  }

  function bestAffectionHeroine() {
    let best = 0;
    state.game.affection.forEach((value, index) => {
      if (value > state.game.affection[best]) best = index;
    });
    return best;
  }

  function stateEventDaySlot() {
    return STATE_EVENT_DAY_SLOTS[`${state.game.month}/${state.game.date}`] || -1;
  }

  function pendingStateEvent(routeId) {
    const daySlot = stateEventDaySlot();
    if (daySlot < 0) return null;
    const heroine = bestAffectionHeroine();
    const preferredStats = ROUTE_STAT_WEIGHTS[routeId] || [];
    const statOrder = [
      ...STATE_EVENT_STAT_KEYS.filter((key) => preferredStats.includes(key)),
      ...STATE_EVENT_STAT_KEYS.filter((key) => !preferredStats.includes(key))
    ];
    for (const statKey of statOrder) {
      const statIndex = STATE_EVENT_STAT_KEYS.indexOf(statKey);
      for (let tier = 0; tier < STATE_EVENT_THRESHOLDS.length; tier += 1) {
        if (STATE_EVENT_DATE_TABLE[heroine]?.[statIndex]?.[tier] !== daySlot) continue;
        if ((state.game.stats[statKey] || 0) <= STATE_EVENT_THRESHOLDS[tier]) continue;
        const file = `${heroine}${statIndex}${tier}`;
        if (!file || state.game.seenStateEvents.includes(file)) continue;
        if (tier > 0) {
          const previous = `${heroine}${statIndex}${tier - 1}`;
          if (!state.game.seenStateEvents.includes(previous)) continue;
        }
        if (!hasFile("stateeventtxt", file)) continue;
        return {
          dir: "stateeventtxt",
          name: file,
          label: "상태 이벤트",
          meta: `${HEROINE_NAMES[heroine]} · ${STAT_NAMES[statKey]} ${STATE_EVENT_THRESHOLDS[tier] + 1}+ · 원작 날짜 슬롯 ${daySlot}`
        };
      }
    }
    return null;
  }

  function meterRow(label, value) {
    const row = document.createElement("div");
    row.className = "meter-row";
    const name = document.createElement("span");
    name.textContent = label;
    const track = document.createElement("div");
    track.className = "meter-track";
    const fill = document.createElement("div");
    fill.className = "meter-fill";
    fill.style.width = `${clamp(value)}%`;
    track.appendChild(fill);
    const number = document.createElement("span");
    number.textContent = String(clamp(value));
    row.appendChild(name);
    row.appendChild(track);
    row.appendChild(number);
    return row;
  }

  function renderGameState() {
    if (!nodes.dateLabel) return;
    nodes.dateLabel.textContent = formatOriginalDate();
    if (nodes.weekLabel) nodes.weekLabel.textContent = weekModeLabel();
    nodes.moneyLabel.textContent = `${state.game.money} cp`;
    const best = bestRoute();
    const active = state.routeId || state.flowId;
    const ending = ENDING_RULES[active] ? conditionStatus(active, ENDING_RULES) : null;
    const unlocks = [
      ending ? `엔딩 ${ending.ok && state.game.confession?.[active] ? "굿 조건" : `부족: ${ending.missing.join(", ") || "고백"}`}` : "",
      state.game.unlockedAfter.length ? `애프터 ${state.game.unlockedAfter.join(", ")}` : ""
    ].filter(Boolean);
    const recent = state.game.lastAction ? ` · 최근 ${state.game.lastAction}` : "";
    nodes.routeLabel.textContent = best
      ? `루트 후보 ${best.title} · ${best.available ? "조건 충족" : `부족: ${best.missing.join(", ")}`}${unlocks.length ? ` · ${unlocks.join(" · ")}` : ""}${recent}`
      : `루트 후보 -${recent}`;

    nodes.statGrid.textContent = "";
    Object.entries(STAT_NAMES).forEach(([key, label]) => {
      nodes.statGrid.appendChild(meterRow(`${label}${statClass(state.game.stats[key])}`, state.game.stats[key]));
    });

    nodes.affectionGrid.textContent = "";
    HEROINE_NAMES.forEach((name, index) => {
      nodes.affectionGrid.appendChild(meterRow(name, state.game.affection[index]));
    });
  }

  function showScreen(screen) {
    state.screen = screen;
    nodes.titleScreen.classList.toggle("hidden", screen !== "title");
    nodes.gameScreen.classList.toggle("hidden", screen !== "game");
    nodes.browserScreen.classList.toggle("hidden", screen !== "browser");
  }

  function cleanText(text) {
    return text
      .replace(/\u0000/g, "")
      .replace(/[\u0001-\u0009\u000b-\u001f\u007f-\u009f]/g, "")
      .replace(/[占쏙７]/g, "")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function speakerFromPrefix(bytes) {
    const i = bytes.lastIndexOf(0x0b);
    if (i === -1 || i + 1 >= bytes.length) return { code: null, name: "나레이션" };
    const code = bytes[i + 1];
    return { code, name: SPEAKERS[code] || "대화" };
  }

  function sceneHintFromPrefix(bytes) {
    let scene = null;
    for (let i = 0; i < bytes.length - 1; i += 1) {
      const belongsToCgCommand = i >= 3 && CG_TRANSITION_COMMANDS.has(bytes[i - 3]) && bytes[i - 2] === 0x00 && bytes[i - 1] === 0x04;
      const belongsToCharacterCommand = (i >= 1 && CHARACTER_COMMANDS.has(bytes[i - 1])) || (i >= 2 && CHARACTER_COMMANDS.has(bytes[i - 2]));
      if (belongsToCgCommand) continue;
      if (belongsToCharacterCommand) continue;
      if (bytes[i] === 0x02 && backgroundPathForId(bytes[i + 1])) scene = bytes[i + 1];
    }
    if (scene !== null) return scene;

    for (let i = bytes.length - 6; i >= 0; i -= 1) {
      if (!TRANSITION_COMMANDS.has(bytes[i])) continue;
      if (CG_TRANSITION_COMMANDS.has(bytes[i])) continue;
      const candidates = [];
      if (bytes[i + 2] === 0x02) candidates.push(bytes[i + 3]);
      if (bytes[i + 2] === 0x0e && bytes[i + 3] === 0x01) candidates.push(bytes[i + 4]);
      if (bytes[i + 3] === 0x0e && bytes[i + 4] === 0x01) candidates.push(bytes[i + 5]);
      candidates.push(bytes[i + 4], bytes[i + 5]);
      const match = candidates.find((value) => backgroundPathForId(value));
      if (match !== undefined) return match;
    }
    return null;
  }

  function positionHintFromPrefix(bytes, start) {
    const end = Math.min(bytes.length - 1, start + 9);
    for (let i = start + 3; i < end; i += 1) {
      if (bytes[i] !== 0x06) continue;
      if (bytes[i + 1] === 1) return "left";
      if (bytes[i + 1] === 2) return "center";
      if (bytes[i + 1] === 3) return "right";
    }
    return null;
  }

  function characterHintFromPrefix(bytes, speakerCode, previousCharacter) {
    let character = null;
    for (let i = 0; i < bytes.length - 2; i += 1) {
      if (!CHARACTER_COMMANDS.has(bytes[i])) continue;
      const first = bytes[i + 1];
      const second = bytes[i + 2];
      if (first === 0xff || second === 0xff) {
        character = null;
        continue;
      }
      const id = bytes[i] === 0x05
        ? (previousCharacter?.id ?? fallbackCharacterForSpeaker(speakerCode) ?? primaryHeroineCharacterId())
        : first;
      const variant = bytes[i] === 0x05 ? (previousCharacter?.variant || 1) : second;
      const expression = bytes[i] === 0x05 ? second : (previousCharacter?.expression || 2);
      if (!hasCharacter(id)) continue;
      const path = characterImageFor(id, variant);
      if (!path) continue;
      character = {
        id,
        variant,
        expression,
        path,
        face: characterFacePathFor(id, expression),
        faceCandidates: characterFaceCandidatesFor(id, expression),
        position: positionHintFromPrefix(bytes, i) || previousCharacter?.position || "center"
      };
    }
    return character;
  }

  function cgHintFromPrefix(bytes) {
    for (let i = bytes.length - 1; i >= 0; i -= 1) {
      if (!CG_TRANSITION_COMMANDS.has(bytes[i])) continue;
      const window = bytes.slice(i + 1, Math.min(bytes.length, i + 7));
      if (window.includes(0xff)) return { clear: true, path: null };
      const priority = bytes[i] === 0xfd
        ? ["Illuster", "MiniIlluster", "Comic", "Cartoon"]
        : ["Cartoon", "Comic", "Illuster", "MiniIlluster"];
      const candidates = [];
      if (bytes[i + 2] === 0x04 && bytes[i + 3] === 0x02) candidates.push(bytes[i + 4]);
      candidates.push(bytes[i + 2], bytes[i + 3], bytes[i + 4], bytes[i + 5]);
      for (const value of candidates) {
        for (const dir of priority) {
          const path = mediaPathFor(dir, value);
          if (path) return { clear: false, path };
        }
      }
    }
    return { clear: false, path: null };
  }

  function cgFromSource() {
    const map = {
      illustertxt: "Illuster",
      miniillustertxt: "MiniIlluster",
      comictxt: "Comic",
      cartoontxt: "Cartoon"
    };
    const dir = map[state.sourceDir];
    return dir ? mediaPathFor(dir, state.scriptName) : null;
  }

  function audioHintFromPrefix(bytes) {
    let audio = null;
    for (let i = 0; i < bytes.length - 1; i += 1) {
      if (bytes[i] !== 0x04) continue;
      const id = bytes[i + 1];
      if (id === 0xff) {
        audio = { stop: true, id: null, path: null, kind: "stop" };
        continue;
      }
      const path = soundPathFor(id);
      if (!path) continue;
      audio = {
        stop: false,
        id,
        path,
        kind: id <= BGM_MAX_ID ? "bgm" : "sfx"
      };
    }
    return audio;
  }

  function effectHintFromPrefix(bytes, audio, text) {
    if (audio?.kind === "sfx" && audio.id >= 20) return audio.id === 21 || /퍽|쾅|쿵|악/.test(text) ? "shake" : "flash";
    for (let i = 0; i < bytes.length - 1; i += 1) {
      if (bytes[i] === 0x03 && bytes[i + 1] !== 0xff) return "shake";
    }
    return null;
  }

  function byteHex(value) {
    return `0x${Number(value || 0).toString(16).padStart(2, "0")}`;
  }

  function rawBytesAt(bytes, offset, length) {
    return Array.from(bytes.slice(offset, Math.min(bytes.length, offset + length))).map(byteHex);
  }

  function characterStateSnapshot(character) {
    if (!character) return null;
    return {
      id: character.id,
      body: character.variant,
      face: character.expression,
      eye: character.eye || null,
      slot: character.variantSlot ?? null,
      position: character.position || "center"
    };
  }

  function bytecodeStateSnapshot(context) {
    return {
      scene: context.result.scene,
      character: characterStateSnapshot(context.result.character)
    };
  }

  function traceBytecodeCommand(context, command) {
    const entry = [
      `[${command.kind}] line=${context.lineNumber}`,
      `offset=${byteHex(command.offset)}`,
      `raw=${command.raw.join(" ")}`,
      `opcode=${command.name}`,
      `operands=${JSON.stringify(command.operands)}`,
      `result=${JSON.stringify(bytecodeStateSnapshot(context))}`
    ].join(" ");
    context.result.trace.push(entry);
    return entry;
  }

  function makeCharacterState(id, variant, expression, previousCharacter, position = null) {
    const path = characterImageFor(id, variant);
    if (!path) return null;
    const eye = previousCharacter?.id === id ? previousCharacter.eye || null : null;
    return {
      id,
      variant,
      expression,
      eye,
      variantSlot: previousCharacter?.id === id ? previousCharacter.variantSlot ?? null : null,
      path,
      face: characterFacePathFor(id, expression),
      faceCandidates: characterFaceCandidatesFor(id, expression),
      eyePath: characterEyePathFor(eye),
      position: position || (previousCharacter?.id === id ? previousCharacter.position : null) || "center"
    };
  }

  function bytecodeLength(fixedLength) {
    return (bytes, offset) => Math.min(fixedLength, Math.max(1, bytes.length - offset));
  }

  function transitionPrefixLength(bytes, offset) {
    return bytes[offset + 1] === 0x00 ? Math.min(2, bytes.length - offset) : 1;
  }

  function visualAssetOperand(bytes, offset) {
    return {
      assetId: bytes[offset + 1] ?? null,
      variant: bytes[offset + 2] ?? null,
      clear: bytes[offset + 1] === 0xff
    };
  }

  function setVisualAssetContext(context, kind, operands) {
    context.visualAsset = {
      kind,
      id: operands.assetId,
      variant: operands.variant,
      clear: operands.clear
    };
    if (context.transition) context.transition = null;
  }

  function inertMarker(name, operandName = "value") {
    return {
      name,
      kind: "STATE",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { [operandName]: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.stateValue = operands[operandName];
      }
    };
  }

  const OPCODE_HANDLERS = {
    0x00: {
      name: "NOOP",
      kind: "CONTROL",
      length: bytecodeLength(1),
      operands: () => ({}),
      execute() {}
    },
    0x01: {
      name: "BLOCK_MARKER",
      kind: "CONTROL",
      length: bytecodeLength(1),
      operands(bytes, offset) {
        return { marker: bytes[offset] };
      },
      execute() {}
    },
    0x02: {
      name: "SET_BACKGROUND",
      kind: "SCENE",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        const bgId = bytes[offset + 1] ?? null;
        return { bgId, valid: backgroundPathForId(bgId) !== null };
      },
      execute(context, operands) {
        if (operands.valid) context.result.scene = operands.bgId;
        if (context.transition) context.transition = null;
      }
    },
    0x03: {
      name: "SET_EFFECT",
      kind: "STATE",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { effectId: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.effectId = operands.effectId;
      }
    },
    0x04: {
      name: "PLAY_AUDIO",
      kind: "AUDIO",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { audioId: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.audioId = operands.audioId;
      }
    },
    0x05: {
      name: "SET_EXPRESSION",
      kind: "FACE",
      length: bytecodeLength(3),
      operands(bytes, offset) {
        return { characterId: bytes[offset + 1] ?? null, faceId: bytes[offset + 2] ?? null };
      },
      execute(context, operands) {
        if (operands.characterId === 0xff || operands.faceId === 0xff) {
          context.result.character = null;
          context.lastCharacterOpcode = "CLEAR_CHARACTER";
          return;
        }
        const id = operands.characterId;
        if (!hasCharacter(id)) {
          context.lastCharacterOpcode = null;
          return;
        }
        const previous = context.result.character || context.previousCharacter;
        const variant = previous?.id === id ? previous.variant || 1 : 1;
        const character = makeCharacterState(id, variant, operands.faceId, previous);
        if (character) context.result.character = character;
        context.lastCharacterOpcode = "SET_EXPRESSION";
      }
    },
    0x06: {
      name: "SET_CONTEXT_VALUE",
      kind: "STATE",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { value: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        const character = context.result.character || context.previousCharacter;
        if (context.lastCharacterOpcode && character && operands.value >= 1 && operands.value <= 3) {
          const position = operands.value === 1 ? "left" : operands.value === 2 ? "center" : "right";
          context.result.character = { ...character, position };
          context.currentKind = "POS";
          context.currentName = "SET_POSITION";
          context.currentOperands = { characterId: character.id, positionId: operands.value, position };
          context.lastCharacterOpcode = null;
          return;
        }
        if (character && operands.value >= 1 && operands.value <= 6) {
          context.result.character = {
            ...character,
            eye: operands.value,
            eyePath: characterEyePathFor(operands.value)
          };
          context.currentKind = "EYE";
          context.currentName = "SET_EYE";
          context.currentOperands = { characterId: character.id, eyeId: operands.value };
          context.lastCharacterOpcode = null;
          return;
        }
        context.stateValue = operands.value;
        context.lastCharacterOpcode = null;
      }
    },
    0x07: {
      name: "SET_CHARACTER_DISPLAY_SLOT_7",
      kind: "CHAR",
      length: bytecodeLength(1),
      operands: () => ({}),
      execute(context) {
        const character = context.result.character || context.previousCharacter;
        if (character) {
          context.result.character = {
            ...character,
            displaySlot: 7
          };
          context.currentOperands = { characterId: character.id, displaySlot: 7 };
        }
        context.lastCharacterOpcode = null;
      }
    },
    0x08: {
      name: "SET_CHARACTER",
      kind: "CHAR",
      length: bytecodeLength(3),
      operands(bytes, offset) {
        return { characterId: bytes[offset + 1] ?? null, bodyId: bytes[offset + 2] ?? null };
      },
      execute(context, operands) {
        if (operands.characterId === 0xff || operands.bodyId === 0xff) {
          context.result.character = null;
          context.lastCharacterOpcode = "CLEAR_CHARACTER";
          return;
        }
        if (!hasCharacter(operands.characterId)) {
          context.lastCharacterOpcode = null;
          return;
        }
        const previous = context.result.character || context.previousCharacter;
        const expression = previous?.id === operands.characterId ? previous.expression || 2 : 2;
        const character = makeCharacterState(operands.characterId, operands.bodyId, expression, previous);
        if (character) context.result.character = character;
        context.lastCharacterOpcode = "SET_CHARACTER";
      }
    },
    0x09: {
      name: "SET_CHARACTER_VARIANT_SLOT",
      kind: "CHAR",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { slotId: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        const character = context.result.character || context.previousCharacter;
        if (!character) {
          context.stateValue = operands.slotId;
          return;
        }
        context.result.character = {
          ...character,
          variantSlot: operands.slotId
        };
        context.currentOperands = { characterId: character.id, slotId: operands.slotId };
      }
    },
    0x0a: {
      name: "LINE_FEED",
      kind: "CONTROL",
      length: bytecodeLength(1),
      operands: () => ({}),
      execute() {}
    },
    0x0b: {
      name: "SET_SPEAKER",
      kind: "SPEAKER",
      length: bytecodeLength(2),
      operands(bytes, offset) {
        return { speakerId: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.speakerCode = operands.speakerId;
      }
    },
    0x0d: {
      name: "LINE_BREAK",
      kind: "CONTROL",
      length(bytes, offset) {
        return bytes[offset + 1] === 0x0a ? 2 : 1;
      },
      operands(bytes, offset) {
        return { crlf: bytes[offset + 1] === 0x0a };
      },
      execute() {}
    },
    0x0e: {
      name: "SET_STATE_VALUE",
      kind: "STATE",
      length(bytes, offset, context) {
        if (context.transition?.opcode === 0xfb && offset + 2 < bytes.length) return 3;
        return bytecodeLength(2)(bytes, offset);
      },
      operands(bytes, offset) {
        return {
          stateValue: bytes[offset + 1] ?? null,
          nextValue: bytes[offset + 2] ?? null
        };
      },
      execute(context, operands) {
        if (context.transition?.opcode === 0xfb) {
          const bgId = operands.nextValue;
          const valid = backgroundPathForId(bgId) !== null;
          if (valid) context.result.scene = bgId;
          context.currentKind = "SCENE";
          context.currentName = "SET_BACKGROUND_FROM_TRANSITION";
          context.currentOperands = {
            groupId: operands.stateValue,
            bgId,
            valid
          };
          context.transition = null;
          return;
        }
        context.stateValue = operands.stateValue;
      }
    },
    0x0f: {
      name: "SET_ILLUSTER",
      kind: "CG",
      length: bytecodeLength(3),
      operands: visualAssetOperand,
      execute(context, operands) {
        setVisualAssetContext(context, "Illuster", operands);
      }
    },
    0x10: {
      name: "SET_CARTOON",
      kind: "CG",
      length: bytecodeLength(3),
      operands: visualAssetOperand,
      execute(context, operands) {
        setVisualAssetContext(context, "Cartoon", operands);
      }
    },
    0x11: {
      name: "SET_COMIC",
      kind: "CG",
      length: bytecodeLength(3),
      operands: visualAssetOperand,
      execute(context, operands) {
        setVisualAssetContext(context, "Comic", operands);
      }
    },
    0x12: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x13: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x14: {
      name: "SET_MINI_ILLUSTER",
      kind: "CG",
      length: bytecodeLength(3),
      operands: visualAssetOperand,
      execute(context, operands) {
        setVisualAssetContext(context, "MiniIlluster", operands);
      }
    },
    0x15: inertMarker("SET_BACKGROUND_GROUP", "groupId"),
    0x16: inertMarker("SET_STATE_EVENT_ID", "eventId"),
    0x17: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x18: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x19: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x1a: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x1b: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x1e: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x1f: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x20: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x21: inertMarker("SET_DATE_BRANCH", "branchId"),
    0x22: inertMarker("SET_DATE_BRANCH", "branchId"),
    0x23: inertMarker("SET_DATE_BRANCH", "branchId"),
    0x24: inertMarker("SET_LOVE_MENU_DRINK", "menuId"),
    0x25: inertMarker("SET_LOVE_RESULT", "resultId"),
    0x26: inertMarker("SET_LOVE_MENU_DESSERT", "menuId"),
    0x27: inertMarker("SET_LOVE_MENU_EXTRA", "menuId"),
    0x28: inertMarker("SET_LOVE_BRANCH", "branchId"),
    0x29: inertMarker("SET_DATE_INTRO_MARKER", "markerId"),
    0x2a: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x2b: inertMarker("SET_DATE_END_MARKER", "markerId"),
    0x2c: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x2d: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x2e: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x2f: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x30: inertMarker("SET_LOVE_EVENT_MARKER", "eventId"),
    0x31: inertMarker("SET_LOVE_BRANCH", "branchId"),
    0x32: inertMarker("SET_LOVE_BRANCH", "branchId"),
    0x33: inertMarker("SET_LOVE_BRANCH", "branchId"),
    0x34: inertMarker("SET_LOVE_BRANCH", "branchId"),
    0x35: inertMarker("SET_LOVE_MENU_CLOSE", "menuId"),
    0x36: inertMarker("SET_LOVE_MENU_END", "menuId"),
    0x37: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x38: inertMarker("SET_SCENE_EVENT_MARKER", "eventId"),
    0x5f: inertMarker("SET_AFTER_STORY_MARKER", "markerId"),
    0xf9: {
      name: "SCENE_TRANSITION_PREFIX",
      kind: "SCENE",
      length: transitionPrefixLength,
      operands(bytes, offset) {
        return { mode: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.transition = { opcode: 0xf9, mode: operands.mode };
      }
    },
    0xfa: {
      name: "COMIC_TRANSITION_PREFIX",
      kind: "CG",
      length: transitionPrefixLength,
      operands(bytes, offset) {
        return { mode: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.transition = { opcode: 0xfa, mode: operands.mode };
      }
    },
    0xfb: {
      name: "BACKGROUND_TRANSITION_PREFIX",
      kind: "SCENE",
      length: transitionPrefixLength,
      operands(bytes, offset) {
        return { mode: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.transition = { opcode: 0xfb, mode: operands.mode };
      }
    },
    0xfc: {
      name: "CARTOON_TRANSITION_PREFIX",
      kind: "CG",
      length: transitionPrefixLength,
      operands(bytes, offset) {
        return { mode: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.transition = { opcode: 0xfc, mode: operands.mode };
      }
    },
    0xfd: {
      name: "ILLUSTER_TRANSITION_PREFIX",
      kind: "CG",
      length: transitionPrefixLength,
      operands(bytes, offset) {
        return { mode: bytes[offset + 1] ?? null };
      },
      execute(context, operands) {
        context.transition = { opcode: 0xfd, mode: operands.mode };
      }
    },
    0xff: {
      name: "COMMAND_SENTINEL",
      kind: "CONTROL",
      length: bytecodeLength(1),
      operands: () => ({ value: 0xff }),
      execute() {}
    }
  };

  const UNKNOWN_OPCODE_HANDLER = {
    name: "UNKNOWN",
    kind: "UNKNOWN",
    length: bytecodeLength(1),
    operands(bytes, offset) {
      return { value: bytes[offset] };
    },
    execute() {}
  };

  function parseVisualBytecode(bytes, speakerCode, previousCharacter, lineNumber = 0) {
    const context = {
      speakerCode,
      previousCharacter,
      lineNumber,
      result: { scene: null, character: null, trace: [] },
      lastCharacterOpcode: null,
      stateValue: null,
      audioId: null,
      effectId: null
    };

    let cursor = 0;
    while (cursor < bytes.length) {
      const offset = cursor;
      const opcode = bytes[offset];
      const handler = OPCODE_HANDLERS[opcode] || UNKNOWN_OPCODE_HANDLER;
      const length = Math.max(1, handler.length(bytes, offset, context));
      const raw = rawBytesAt(bytes, offset, length);
      const operands = handler.operands(bytes, offset, context, length);
      context.currentKind = null;
      context.currentName = null;
      context.currentOperands = null;
      handler.execute(context, operands, offset, length);
      traceBytecodeCommand(context, {
        offset,
        raw,
        name: context.currentName || handler.name,
        kind: context.currentKind || handler.kind,
        operands: context.currentOperands || operands
      });
      cursor += length;
    }

    return context.result;
  }

  function visualCommandsFromPrefix(bytes, speakerCode, previousCharacter, lineNumber = 0) {
    return parseVisualBytecode(bytes, speakerCode, previousCharacter, lineNumber);
  }

  function controlsFromPrefix(prefix, speakerCode, previousCharacter, text, lineNumber = 0) {
    const visual = visualCommandsFromPrefix(prefix, speakerCode, previousCharacter, lineNumber);
    const scene = visual.scene;
    const character = visual.character;
    const cg = cgHintFromPrefix(prefix);
    const audio = audioHintFromPrefix(prefix);
    const effect = effectHintFromPrefix(prefix, audio, text);
    return { scene, character, cg, audio, effect, trace: visual.trace };
  }

  function hasCommand(bytes, command, value = null) {
    for (let i = 0; i < bytes.length - 1; i += 1) {
      if (bytes[i] === command && (value === null || bytes[i + 1] === value)) return true;
    }
    return false;
  }

  function optionInfo(event, expectedNumber = null) {
    const match = String(event?.text || "").match(/^\s*([1-9])[\.)]\s*(.+)$/s);
    if (!match) return null;
    const number = Number(match[1]);
    if (expectedNumber !== null && number !== expectedNumber) return null;
    return {
      number,
      label: cleanText(match[2]) || String(event.text).trim()
    };
  }

  function choiceBranchCommand() {
    if (state.sourceDir === "datetxt") return 0x06;
    if (state.sourceDir === "lovetxt") return 0x25;
    return null;
  }

  function isChoiceBranchStart(event) {
    const branchCommand = choiceBranchCommand();
    return branchCommand !== null && hasCommand(event?._prefix || [], 0x01, branchCommand);
  }

  function isChoiceContinuation(event) {
    return state.sourceDir === "lovetxt" && hasCommand(event?._prefix || [], 0x01, 0x35);
  }

  function commandValue(bytes, command) {
    for (let i = 0; i < bytes.length - 1; i += 1) {
      if (bytes[i] === command) return bytes[i + 1];
    }
    return null;
  }

  function hiddenLoveMenuType(event) {
    if (state.sourceDir !== "lovetxt" || !hasCommand(event?._prefix || [], 0x01, 0x25)) return null;
    if (hasCommand(event._prefix, 0x01, 0x26)) return "drink";
    if (hasCommand(event._prefix, 0x01, 0x27)) return "dessert";
    return null;
  }

  function hiddenLoveMenuOptionLabel(type, index, branchValue) {
    const labels = type === "drink"
      ? ["\uc74c\ub8cc A", "\uc74c\ub8cc B", "\uc74c\ub8cc C", "\uc74c\ub8cc \uc0dd\ub7b5"]
      : ["\ub514\uc800\ud2b8 A", "\ub514\uc800\ud2b8 B", "\ub514\uc800\ud2b8 C", "\ub2e4\uc74c\uc5d0 \uba39\uae30"];
    if (branchValue === 0x00) return type === "drink" ? "\uc74c\ub8cc \uc0dd\ub7b5" : "\ub2e4\uc74c\uc5d0 \uba39\uae30";
    return labels[index] || `${type === "drink" ? "\uc74c\ub8cc" : "\ub514\uc800\ud2b8"} ${index + 1}`;
  }

  function loveModeBytes(loveNum = Number(state.scriptName)) {
    const raw = state.loveModeTable?.[String(loveNum)];
    return Array.isArray(raw) ? raw.map((value) => Number(value) & 0xff).slice(0, 5) : [];
  }

  function heroineFromLoveNum(loveNum) {
    if (loveNum >= 1 && loveNum <= 4) return 0;
    if (loveNum >= 5 && loveNum <= 8) return 1;
    if (loveNum >= 9 && loveNum <= 12) return 2;
    if (loveNum >= 13 && loveNum <= 14) return 3;
    if (loveNum >= 15 && loveNum <= 16) return 4;
    return state.routeId && ROUTE_RULES[state.routeId] ? ROUTE_RULES[state.routeId].heroine : null;
  }

  function loveMenuHeroineIndex(loveNum) {
    const heroine = heroineFromLoveNum(loveNum);
    return Number.isInteger(heroine) ? heroine : 0;
  }

  function loveMenuGroupsFor(loveNum) {
    return LOVE_MENU_GROUPS[loveMenuHeroineIndex(loveNum)] || LOVE_MENU_GROUPS[0];
  }

  function loveMenuDrinkGroupOrder(preference) {
    const preferred = Math.max(0, Math.min(2, Number(preference || 1) - 1));
    return [preferred, ...[0, 1, 2].filter((groupIndex) => groupIndex !== preferred)];
  }

  function loveMenuItemNames(type, itemIds) {
    const names = type === "drink" ? LOVE_DRINK_NAMES : LOVE_CAKE_NAMES;
    return (itemIds || []).map((id) => names[id]).filter(Boolean);
  }

  function loveMenuIcon(type, itemIds = []) {
    if (type === "dessert") return LOVE_MENU_ICONS.cake;
    const hasCoffee = itemIds.some((id) => id >= 1 && id <= 4);
    const hasOtherDrink = itemIds.some((id) => id >= 5);
    return hasCoffee && !hasOtherDrink ? LOVE_MENU_ICONS.coffee : LOVE_MENU_ICONS.drink;
  }

  function loveMenuNativeChoice(type, optionIndex, table, loveNum, branchValue) {
    if ((Number(branchValue ?? 0) & 0xff) === 0x00) {
      return {
        groupIndex: null,
        itemIds: [],
        itemNames: [],
        icon: type === "drink" ? LOVE_MENU_ICONS.drink : LOVE_MENU_ICONS.cake,
        preference: type === "drink" ? (table[0] ?? null) : (table[2] ?? null)
      };
    }

    const groups = loveMenuGroupsFor(loveNum);
    if (type === "drink") {
      const order = loveMenuDrinkGroupOrder(table[0]);
      const groupIndex = order[optionIndex] ?? optionIndex;
      const itemIds = groups.drink[groupIndex] || [];
      return {
        groupIndex,
        itemIds,
        itemNames: loveMenuItemNames("drink", itemIds),
        icon: loveMenuIcon("drink", itemIds),
        preference: table[0] ?? null
      };
    }

    const groupIndex = optionIndex;
    const itemIds = groups.cake[groupIndex] || [];
    return {
      groupIndex,
      itemIds,
      itemNames: loveMenuItemNames("dessert", itemIds),
      icon: LOVE_MENU_ICONS.cake,
      preference: table[2] ?? null
    };
  }

  function loveMenuTableValue(type, index, table) {
    if (!Array.isArray(table) || !table.length) return null;
    const offset = type === "drink" ? 0 : 2;
    return Number.isFinite(table[offset]) ? table[offset] : null;
  }

  function loveMenuInfo(type, index, branchValue) {
    const loveNum = Number(String(state.scriptName).match(/\d+/)?.[0] || 0);
    const table = loveModeBytes(loveNum);
    const value = Number(branchValue ?? 0) & 0xff;
    const result = LOVE_MENU_RESULTS[value] || LOVE_MENU_RESULTS[0x01];
    const nativeChoice = loveMenuNativeChoice(type, index, table, loveNum, value);
    return {
      type,
      optionIndex: index,
      branchValue: value,
      loveNum,
      heroine: heroineFromLoveNum(loveNum),
      table,
      tableValue: nativeChoice.preference,
      nativeGroup: nativeChoice.groupIndex,
      nativePreference: nativeChoice.preference,
      itemIds: nativeChoice.itemIds,
      itemNames: nativeChoice.itemNames,
      icon: nativeChoice.icon,
      result: result.id,
      affection: result.affection
    };
  }

  function buildHiddenLoveMenu(rawEvents, branchStart) {
    const type = hiddenLoveMenuType(rawEvents[branchStart]);
    if (!type) return null;

    const branchStarts = [];
    let continuationStart = rawEvents.length;
    for (let cursor = branchStart; cursor < rawEvents.length; cursor += 1) {
      if (isChoiceContinuation(rawEvents[cursor]) && branchStarts.length) {
        continuationStart = cursor;
        break;
      }
      if (isChoiceBranchStart(rawEvents[cursor])) branchStarts.push(cursor);
    }
    if (branchStarts.length < 2 || continuationStart >= rawEvents.length) return null;

    const options = branchStarts.map((blockStart, index) => {
      const blockEnd = index < branchStarts.length - 1 ? branchStarts[index + 1] : continuationStart;
      const branchRaw = rawEvents.slice(blockStart, blockEnd);
      const continuationRaw = rawEvents.slice(continuationStart);
      const branchValue = commandValue(rawEvents[blockStart]._prefix || [], 0x25);
      const loveMenu = loveMenuInfo(type, index, branchValue);
      const label = loveMenu.itemNames.length
        ? loveMenu.itemNames.join(" / ")
        : hiddenLoveMenuOptionLabel(type, index, branchValue);
      return {
        label,
        meta: rawEvents[blockStart].text,
        icon: loveMenu.icon,
        loveMenu,
        events: transformChoiceBranches([...branchRaw, ...continuationRaw])
      };
    });

    return {
      branchStart,
      choice: {
        title: type === "drink" ? "음료 선택" : "디저트 선택",
        options
      }
    };
  }

  function publicEvent(event) {
    const { _prefix, ...rest } = event;
    return rest;
  }

  function copyEvent(event) {
    return {
      ...event,
      character: event.character ? { ...event.character } : null,
      audio: event.audio ? { ...event.audio } : null,
      choice: event.choice ? {
        title: event.choice.title,
        options: event.choice.options.map((option) => ({
          label: option.label,
          meta: option.meta,
          icon: option.icon || null,
          loveMenu: option.loveMenu ? {
            ...option.loveMenu,
            table: Array.isArray(option.loveMenu.table) ? [...option.loveMenu.table] : [],
            itemIds: Array.isArray(option.loveMenu.itemIds) ? [...option.loveMenu.itemIds] : [],
            itemNames: Array.isArray(option.loveMenu.itemNames) ? [...option.loveMenu.itemNames] : []
          } : null,
          events: copyEvents(option.events)
        }))
      } : null
    };
  }

  function copyEvents(events) {
    return events.map(copyEvent);
  }

  function findNumberedChoice(rawEvents, start) {
    const first = optionInfo(rawEvents[start], 1);
    if (!first) return null;
    const options = [first];
    let cursor = start + 1;
    while (cursor < rawEvents.length) {
      const next = optionInfo(rawEvents[cursor], options.length + 1);
      if (!next) break;
      options.push(next);
      cursor += 1;
    }
    return options.length >= 2 ? { options, optionEnd: cursor } : null;
  }

  function buildChoiceFromRaw(rawEvents, optionStart, parsedChoice) {
    const branchStarts = [];
    for (let cursor = parsedChoice.optionEnd; cursor < rawEvents.length; cursor += 1) {
      if (isChoiceContinuation(rawEvents[cursor]) && branchStarts.length >= parsedChoice.options.length) break;
      if (isChoiceBranchStart(rawEvents[cursor])) {
        branchStarts.push(cursor);
        if (branchStarts.length >= parsedChoice.options.length) break;
      }
    }
    if (branchStarts.length < parsedChoice.options.length) return null;

    let continuationStart = rawEvents.length;
    for (let cursor = branchStarts[branchStarts.length - 1] + 1; cursor < rawEvents.length; cursor += 1) {
      if (isChoiceContinuation(rawEvents[cursor])) {
        continuationStart = cursor;
        break;
      }
    }

    const options = parsedChoice.options.map((option, index) => {
      const blockStart = branchStarts[index];
      const blockEnd = index < branchStarts.length - 1 ? branchStarts[index + 1] : continuationStart;
      const branchRaw = rawEvents.slice(blockStart, blockEnd);
      const continuationRaw = rawEvents.slice(continuationStart);
      return {
        label: option.label,
        meta: `${state.sourceDir}/${state.scriptName} · 선택 ${option.number}`,
        events: transformChoiceBranches([...branchRaw, ...continuationRaw])
      };
    });

    return {
      optionStart,
      optionEnd: parsedChoice.optionEnd,
      branchEnd: rawEvents.length,
      choice: {
        title: "SELECT",
        options
      }
    };
  }

  function transformChoiceBranches(rawEvents) {
    const output = [];
    for (let i = 0; i < rawEvents.length; i += 1) {
      const hiddenMenu = buildHiddenLoveMenu(rawEvents, i);
      if (hiddenMenu) {
        if (output.length) {
          output[output.length - 1].choice = hiddenMenu.choice;
        } else {
          const synthetic = publicEvent(rawEvents[i]);
          synthetic.text = hiddenMenu.choice.title;
          synthetic.choice = hiddenMenu.choice;
          output.push(synthetic);
        }
        return output;
      }

      const parsedChoice = findNumberedChoice(rawEvents, i);
      if (parsedChoice) {
        const branch = buildChoiceFromRaw(rawEvents, i, parsedChoice);
        if (branch) {
          if (output.length) {
            const attach = output[output.length - 1];
            attach.choice = branch.choice;
          } else {
            const synthetic = publicEvent(rawEvents[i]);
            synthetic.text = "선택";
            synthetic.choice = branch.choice;
            output.push(synthetic);
          }
          return output;
        }
      }
      output.push(publicEvent(rawEvents[i]));
    }
    return output;
  }

  function parseScript(buffer) {
    const bytes = new Uint8Array(buffer);
    const decoder = new TextDecoder("utf-8");
    const events = [];
    let segmentStart = 0;
    let lastScene = null;
    let lastSpeaker = { code: null, name: "나레이션" };
    let lastCharacter = null;
    let lastCg = cgFromSource();
    let lineNumber = 0;
    state.scriptTrace = [];

    for (let i = 0; i < bytes.length; i += 1) {
      if (bytes[i] !== 0x0c) continue;
      let end = i + 1;
      while (end < bytes.length && bytes[end] !== 0x00) end += 1;

      const prefix = Array.from(bytes.slice(segmentStart, i));
      let textStart = i + 1;
      for (let nested = end - 1; nested > i + 1; nested -= 1) {
        if (bytes[nested] !== 0x0c) continue;
        prefix.push(...Array.from(bytes.slice(i + 1, nested)));
        textStart = nested + 1;
        break;
      }
      const raw = decoder.decode(bytes.slice(textStart, end));
      const text = cleanText(raw);
      const speaker = speakerFromPrefix(prefix);
      if (speaker.code !== null) lastSpeaker = speaker;
      const eventSpeaker = speaker.code === null ? lastSpeaker : speaker;
      const nextLineNumber = text.length > 0 ? lineNumber + 1 : lineNumber;
      const controls = controlsFromPrefix(prefix, eventSpeaker.code, lastCharacter, text, nextLineNumber);
      if (controls.scene !== null) lastScene = controls.scene;
      if (controls.character) lastCharacter = controls.character;
      if (controls.cg.clear) lastCg = null;
      else if (controls.cg.path) lastCg = controls.cg.path;
      if (controls.trace?.length) state.scriptTrace.push(...controls.trace);

      if (text.length > 0 && /[가-힣A-Za-z0-9.?!…-]/.test(text)) {
        lineNumber += 1;
        events.push({
          text,
          speaker: eventSpeaker.name,
          speakerCode: eventSpeaker.code,
          scene: lastScene,
          background: backgroundPathForId(lastScene),
          character: lastCg ? null : (lastCharacter ? { ...lastCharacter } : null),
          cg: lastCg,
          audio: controls.audio,
          effect: controls.effect,
          trace: controls.trace || [],
          _prefix: prefix
        });
      }

      segmentStart = end + 1;
      i = end;
    }

    if (!events.length) return [{ text: "대본을 읽을 수 없습니다.", speaker: "SYSTEM", speakerCode: null, scene: 1 }];
    return state.sourceDir === "datetxt" || state.sourceDir === "lovetxt"
      ? transformChoiceBranches(events)
      : events.map(publicEvent);
  }

  function currentScriptKey() {
    return `${state.sourceDir}/${state.scriptName}`;
  }

  function advanceCalendar(days = 1) {
    for (let i = 0; i < days; i += 1) {
      state.game.day += 1;
      state.game.weekday = (state.game.weekday + 1) % 7;
      state.game.date += 1;
      const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][state.game.month - 1] || 30;
      if (state.game.date > monthLength) {
        state.game.date = 1;
        state.game.month = state.game.month === 12 ? 1 : state.game.month + 1;
      }
    }
  }

  function addStats(stats) {
    Object.entries(stats || {}).forEach(([key, value]) => {
      state.game.stats[key] = clamp((state.game.stats[key] || 0) + value);
    });
  }

  function addAffection(index, value) {
    if (index < 0 || index >= HEROINE_NAMES.length) return;
    state.game.affection[index] = clamp(state.game.affection[index] + value);
    state.game.routePoints[index] = clamp(state.game.routePoints[index] + Math.max(0, Math.ceil(value / 2)), 0, 999);
  }

  function applyLoveMenuChoice(loveMenu) {
    if (!loveMenu || state.sourceDir !== "lovetxt") return;
    const loveNum = Number(loveMenu.loveNum || String(state.scriptName).match(/\d+/)?.[0] || 0);
    if (!loveNum || !loveMenu.type) return;
    const key = `lovemode:${loveNum}:${loveMenu.type}`;
    const resultKey = `${key}:result`;

    const branchValue = Number(loveMenu.branchValue ?? 0) & 0xff;
    const result = LOVE_MENU_RESULTS[branchValue] || LOVE_MENU_RESULTS[0x01];
    const heroine = Number.isInteger(loveMenu.heroine) ? loveMenu.heroine : heroineFromLoveNum(loveNum);
    if (Number.isInteger(heroine)) addAffection(heroine, result.affection);

    const table = Array.isArray(loveMenu.table) ? loveMenu.table.map((value) => Number(value) & 0xff) : loveModeBytes(loveNum);
    const record = {
      key,
      script: currentScriptKey(),
      loveNum,
      type: loveMenu.type,
      optionIndex: Number(loveMenu.optionIndex || 0),
      branchValue,
      table,
      tableValue: Number.isFinite(loveMenu.tableValue) ? loveMenu.tableValue : loveMenuTableValue(loveMenu.type, Number(loveMenu.optionIndex || 0), table),
      nativeGroup: Number.isFinite(loveMenu.nativeGroup) ? loveMenu.nativeGroup : null,
      nativePreference: Number.isFinite(loveMenu.nativePreference) ? loveMenu.nativePreference : null,
      itemIds: Array.isArray(loveMenu.itemIds) ? loveMenu.itemIds.map((id) => Number(id)).filter(Number.isFinite) : [],
      itemNames: Array.isArray(loveMenu.itemNames) ? [...loveMenu.itemNames] : [],
      result: result.id,
      affection: result.affection,
      heroine
    };

    state.game.flags[resultKey] = result.id;
    state.game.flags[`${key}:branch`] = branchValue;
    state.game.flags[`${key}:option`] = record.optionIndex + 1;
    state.game.flags[`${key}:table`] = table.join(",");
    state.game.flags[`${key}:count`] = Math.max(0, Number(state.game.flags[`${key}:count`] || 0)) + 1;
    if (record.tableValue !== null) state.game.flags[`${key}:tableValue`] = record.tableValue;
    if (record.nativeGroup !== null) state.game.flags[`${key}:group`] = record.nativeGroup + 1;
    if (record.nativePreference !== null) state.game.flags[`${key}:preference`] = record.nativePreference;
    if (record.itemIds.length) state.game.flags[`${key}:itemIds`] = record.itemIds.join(",");
    if (record.itemNames.length) state.game.flags[`${key}:items`] = record.itemNames.join(" / ");
    state.game.loveMenuResults.push(record);
    if (state.game.loveMenuResults.length > 50) state.game.loveMenuResults = state.game.loveMenuResults.slice(-50);
    state.game.lastLoveNum = loveNum;
    const heroineLabel = Number.isInteger(heroine) ? HEROINE_NAMES[heroine] : "LOVE";
    const typeLabel = loveMenu.type === "drink" ? "\uc74c\ub8cc" : "\ub514\uc800\ud2b8";
    const pickedLabel = record.itemNames.length ? record.itemNames.join("/") : typeLabel;
    const delta = result.affection > 0 ? `+${result.affection}` : String(result.affection);
    state.game.lastAction = `${heroineLabel} ${pickedLabel} ${result.label} (${delta})`;
    renderGameState();
  }

  function dominantHeroineFromEvents() {
    const counts = [0, 0, 0, 0, 0];
    state.events.forEach((event) => {
      if (Number.isFinite(event.speakerCode) && event.speakerCode >= 0 && event.speakerCode <= 4) {
        counts[event.speakerCode] += 1;
      }
    });
    let bestIndex = 0;
    counts.forEach((count, index) => {
      if (count > counts[bestIndex]) bestIndex = index;
    });
    return counts[bestIndex] > 0 ? { index: bestIndex, count: counts[bestIndex] } : null;
  }

  function scriptImpact() {
    const scriptNum = Number(String(state.scriptName).match(/\d+/)?.[0] || 0);
    const impact = {
      days: 1,
      stats: {},
      affection: [0, 0, 0, 0, 0],
      note: "스토리 진행"
    };

    const dominant = dominantHeroineFromEvents();
    if (dominant) {
      impact.affection[dominant.index] += Math.min(5, 1 + Math.floor(dominant.count / 18));
      impact.note = `${HEROINE_NAMES[dominant.index]} 이벤트`;
    }

    if (state.flowId && ROUTE_RULES[state.flowId]) {
      impact.affection[ROUTE_RULES[state.flowId].heroine] += 2;
      impact.days = scriptNum % 5 === 0 ? 2 : 1;
    } else if (state.flowId === "common") {
      impact.days = scriptNum % 6 === 0 ? 2 : 1;
    }

    if (/시험|공부|학교|수업|단어장/.test(state.events.map((event) => event.text).join(" "))) impact.stats.study = (impact.stats.study || 0) + 1;
    if (/달리|운동|체육|뛰|몸/.test(state.events.map((event) => event.text).join(" "))) impact.stats.exercise = (impact.stats.exercise || 0) + 1;
    if (/바다|음악|책|소설|생각|감정/.test(state.events.map((event) => event.text).join(" "))) impact.stats.sense = (impact.stats.sense || 0) + 1;
    if (/옷|데이트|웃|예쁘|카페|선물/.test(state.events.map((event) => event.text).join(" "))) impact.stats.charm = (impact.stats.charm || 0) + 1;

    return impact;
  }

  function recordScriptCompletion() {
    const key = currentScriptKey();
    if (state.game.completedScripts.includes(key)) return;
    state.game.completedScripts.push(key);
    if (state.sourceDir !== "Scripttxt") {
      renderGameState();
      save();
      return;
    }

    const impact = scriptImpact();
    advanceCalendar(impact.days);
    addStats(impact.stats);
    impact.affection.forEach((value, index) => addAffection(index, value));
    state.game.fatigue = clamp(state.game.fatigue - 3, 0, 100);
    state.game.lastAction = impact.note;
    renderGameState();
    save();
  }

  function isWeekendCheckpoint() {
    return state.game.weekday === 0 || state.game.weekday === 6 || state.game.day % 7 === 0;
  }

  function rootTableForFlow(id) {
    return ORIGINAL_ROOTS[id] || null;
  }

  function scriptSequenceForFlow(flow) {
    if (!flow) return [];
    const root = rootTableForFlow(flow.id);
    if (root) return availableScripts(root.filter((entry) => entry > 0).map(String));
    return availableScripts(flow.scripts);
  }

  function rootCursorForScript(flowId, scriptName, preferred = 0) {
    const root = rootTableForFlow(flowId);
    if (!root) return -1;
    const numericName = Number(scriptName);
    if (Number.isFinite(numericName) && root[preferred] === numericName) return preferred;
    const fromPreferred = root.findIndex((entry, index) => index >= preferred && entry === numericName);
    if (fromPreferred >= 0) return fromPreferred;
    return root.findIndex((entry) => entry === numericName);
  }

  function rootSequenceIndex(root, cursor) {
    let index = -1;
    for (let i = 0; i <= cursor; i += 1) {
      if (root[i] > 0 && state.scriptSet.has(String(root[i]))) index += 1;
    }
    return Math.max(0, index);
  }

  function markerSummary(markers = []) {
    const names = [...new Set(markers.map((marker) => ROOT_MARKERS[String(marker)]).filter(Boolean))];
    return names.length ? names.join(" / ") : "루트 진행";
  }

  function dateTableForRoute(routeId) {
    return DATE_TABLES[routeId] || null;
  }

  function routeHeroineIndex(routeId) {
    return ROUTE_RULES[routeId]?.heroine ?? HEROINE_ROUTE_IDS.indexOf(routeId);
  }

  function dateRowForRoute(routeId) {
    const table = dateTableForRoute(routeId);
    const heroine = routeHeroineIndex(routeId);
    if (!table || heroine < 0) return null;
    const count = Math.max(0, state.game.dateCount[heroine] || 0);
    const rowIndex = count % table.length;
    return {
      heroine,
      row: table[rowIndex],
      rowIndex,
      count
    };
  }

  function dateFileFor(heroine, place, variant = 0) {
    const files = new Set(state.fileIndex.get("datetxt") || []);
    const rawPlace = String(place);
    const paddedPlace = String(place).padStart(2, "0");
    const candidates = [
      `${heroine}${rawPlace}${variant}`,
      `${heroine}${rawPlace}`,
      `${heroine}${paddedPlace}${variant}`,
      `${heroine}${paddedPlace}`,
      `${heroine}${rawPlace}1`,
      `${heroine}${paddedPlace}1`
    ];
    return candidates.find((name) => files.has(name)) || null;
  }

  function loveNumFor(routeId, place) {
    const heroine = routeHeroineIndex(routeId);
    const special = place === 9 || place === 10;
    if (heroine === 0) {
      if (place === 4) return 1;
      if (place === 6) return 2;
      return special ? 3 : 4;
    }
    if (heroine === 1) {
      if (place === 4) return 5;
      if (place === 6) return 6;
      return special ? 7 : 8;
    }
    if (heroine === 2) {
      if (place === 4) return 9;
      if (place === 6) return 10;
      return special ? 11 : 12;
    }
    if (heroine === 3) return special ? 13 : 14;
    if (heroine === 4) return special ? 15 : 16;
    return null;
  }

  function dateCandidatesForRoute(routeId) {
    const dateRow = dateRowForRoute(routeId);
    if (!dateRow) return [];
    const routeHeroine = dateRow.heroine;
    const preferredPlace = dateRow.row[routeHeroine];
    const orderedPlaces = [preferredPlace, ...dateRow.row].filter((place) => Number.isFinite(place));
    const uniquePlaces = [...new Set(orderedPlaces)];
    return uniquePlaces.map((place, index) => {
      const file = dateFileFor(routeHeroine, place, index > 0 ? 1 : 0) || dateFileFor(routeHeroine, place, 0);
      const placeName = DATE_PLACE_NAMES[place] || `장소 ${place}`;
      const loveNum = loveNumFor(routeId, place);
      const loveMeta = loveNum && hasFile("lovetxt", String(loveNum)) ? ` · lovetxt/${loveNum}` : "";
      return {
        place,
        file,
        loveNum,
        preferred: place === preferredPlace,
        label: `${HEROINE_NAMES[routeHeroine]} 데이트: ${placeName}`,
        meta: file ? `datetxt/${file}${place === preferredPlace ? " · 원작 기본" : ""}${loveMeta}` : `데이트표 ${dateRow.rowIndex + 1}행 · 대체 진행${loveMeta}`
      };
    });
  }

  function confessionStatus(routeId) {
    return conditionStatus(routeId, CONFESSION_RULES);
  }

  function canOfferConfession(routeId, dateChoice) {
    const status = confessionStatus(routeId);
    return status.ok && (dateChoice?.place === 13 || routeProgress(routeId) >= status.rule.minProgress);
  }

  function applyConfession(routeId) {
    const heroine = routeHeroineIndex(routeId);
    if (heroine < 0) return;
    state.game.confession[routeId] = true;
    state.game.flags[`confession:${routeId}`] = true;
    addAffection(heroine, 6);
    state.game.lastAction = `${HEROINE_NAMES[heroine]} 고백 성립`;
    renderGameState();
    save();
  }

  function applyDateChoice(routeId, choice) {
    const heroine = routeHeroineIndex(routeId);
    if (heroine < 0 || !choice) return;
    const affectionGain = choice.place >= 12 ? 5 : choice.place >= 10 ? 4 : 3;
    addAffection(heroine, affectionGain);
    state.game.dateCount[heroine] = Math.max(0, (state.game.dateCount[heroine] || 0) + 1);
    state.game.money = Math.max(0, state.game.money - (choice.place >= 12 ? 60 : 35));
    state.game.fatigue = clamp(state.game.fatigue + 6, 0, 100);
    state.game.lastDatePlace = {
      routeId,
      heroine,
      place: choice.place,
      file: choice.file,
      count: state.game.dateCount[heroine]
    };
    state.game.lastLoveNum = choice.loveNum ?? loveNumFor(routeId, choice.place);
    state.game.flags[`date:${routeId}:${choice.place}`] = true;
    if (state.game.lastLoveNum !== null) state.game.flags[`loveNum:${routeId}`] = state.game.lastLoveNum;
    const confessed = canOfferConfession(routeId, choice);
    if (confessed) applyConfession(routeId);
    state.game.lastAction = confessed ? `${HEROINE_NAMES[heroine]} 고백 성립` : `${HEROINE_NAMES[heroine]} 데이트`;
    advanceCalendar(1);
    renderGameState();
    save();
  }

  function applyWeekAction(actionId) {
    const action = WEEK_ACTIONS.find((item) => item.id === actionId);
    if (!action) return;
    addStats(action.stats);
    state.game.money = Math.max(0, state.game.money + action.money);
    state.game.fatigue = clamp(state.game.fatigue + (action.fatigue || 4), 0, 100);
    state.game.lastAction = action.label;
    advanceCalendar(1);
    renderGameState();
    save();
  }

  function backgroundFor(index, event) {
    const list = state.backgrounds;
    if (!list.length) return state.manifest.title.background;
    if (event?.background) return event.background;
    const scene = event && Number.isFinite(event.scene) ? event.scene : null;
    if (scene !== null) {
      const exact = list.find((path) => path === `Bg/${scene}.png` || path.endsWith(`/${scene}.png`));
      if (exact) return exact;
    }
    return list.find((path) => path === "Bg/1.png" || path.endsWith("/1.png")) || state.manifest.title.background;
  }

  function sceneDisplayLabel(event) {
    const background = backgroundFor(state.eventIndex, event);
    const scene = event && Number.isFinite(event.scene) ? event.scene : numericStem(background);
    if (SCENE_LABELS[scene]) return SCENE_LABELS[scene];
    const lastPlace = state.game.lastDatePlace?.place;
    if (Number.isFinite(lastPlace)) {
      if (lastPlace === 6) return "\ud574\ubcc0\uac00";
      return DATE_PLACE_NAMES[lastPlace] || "\uc7a5\uc18c";
    }
    const flow = activeFlow();
    return flow?.title || "\uc7a5\uc18c";
  }

  function spriteFor(event) {
    if (event?.character?.path) return event.character.path;
    return null;
  }

  function ensureBgmAudio() {
    if (!state.bgmAudio) {
      state.bgmAudio = new Audio();
      state.bgmAudio.loop = true;
      state.bgmAudio.volume = 0.42;
    }
    return state.bgmAudio;
  }

  function playBgm(path) {
    if (!path || state.currentBgm === path) return;
    state.currentBgm = path;
    state.pendingBgm = path;
    const audio = ensureBgmAudio();
    audio.src = asset(path);
    audio.loop = true;
    if (!state.audioUnlocked) return;
    audio.play().then(() => {
      state.pendingBgm = null;
    }).catch(() => {
      state.pendingBgm = path;
    });
  }

  function stopBgm() {
    if (state.bgmAudio) state.bgmAudio.pause();
    state.currentBgm = null;
    state.pendingBgm = null;
  }

  function playSfx(path) {
    if (!path || !state.audioUnlocked) return;
    const audio = new Audio(asset(path));
    audio.volume = 0.62;
    audio.play().catch(() => {});
  }

  function unlockAudio() {
    if (state.audioUnlocked) return;
    state.audioUnlocked = true;
    if (state.pendingBgm) playBgm(state.pendingBgm);
  }

  function applyAudio(event) {
    const audio = event?.audio;
    if (!audio) return;
    if (audio.stop) {
      stopBgm();
      return;
    }
    if (audio.kind === "bgm") playBgm(audio.path);
    else playSfx(audio.path);
  }

  function applyEffect(event) {
    nodes.gameScreen.classList.remove("shake", "flash");
    const effect = event?.effect;
    if (!effect) return;
    requestAnimationFrame(() => {
      nodes.gameScreen.classList.add(effect);
      setTimeout(() => nodes.gameScreen.classList.remove(effect), effect === "shake" ? 420 : 300);
    });
  }

  function stopTyping() {
    if (state.typing) {
      clearInterval(state.typing);
      state.typing = null;
    }
  }

  function currentEvent() {
    return state.events[state.eventIndex] || null;
  }

  function showInlineChoice(event = currentEvent()) {
    if (!event?.choice || state.choiceOpen) return;
    showChoices(event.choice.title || "SELECT", event.choice.options.map((option, index) => ({
      label: option.label,
      meta: option.meta,
      icon: option.icon,
      action: () => selectInlineChoice(event, index)
    })));
  }

  function selectInlineChoice(event, optionIndex) {
    if (!event?.choice) return;
    const option = event.choice.options[optionIndex];
    if (!option) return;
    applyLoveMenuChoice(option.loveMenu);
    const fixedEvent = copyEvent({ ...event, choice: null });
    const prefix = copyEvents(state.events.slice(0, state.eventIndex));
    state.events = [...prefix, fixedEvent, ...copyEvents(option.events)];
    state.scriptChoicePath.push(optionIndex);
    state.eventIndex = prefix.length + 1;
    if (state.eventIndex < state.events.length) {
      renderEvent();
    } else {
      finishScript();
    }
  }

  function applyChoicePath(events, path = []) {
    let hydrated = copyEvents(events);
    path.forEach((rawIndex) => {
      const choiceIndex = Number(rawIndex);
      if (!Number.isFinite(choiceIndex)) return;
      const eventIndex = hydrated.findIndex((event) => event.choice);
      if (eventIndex < 0) return;
      const event = hydrated[eventIndex];
      const option = event.choice.options[choiceIndex];
      if (!option) return;
      const fixedEvent = copyEvent({ ...event, choice: null });
      hydrated = [
        ...copyEvents(hydrated.slice(0, eventIndex)),
        fixedEvent,
        ...copyEvents(option.events)
      ];
    });
    return hydrated;
  }

  function typeText(text) {
    stopTyping();
    state.fullText = text;
    state.visibleText = "";
    nodes.dialogue.textContent = "";
    let i = 0;
    state.typing = setInterval(() => {
      i += text.length > 80 ? 3 : 2;
      state.visibleText = text.slice(0, i);
      nodes.dialogue.textContent = state.visibleText;
      if (i >= text.length) {
        stopTyping();
        if (currentEvent()?.choice) {
          setTimeout(() => showInlineChoice(), 120);
          return;
        }
        if (state.auto) setTimeout(next, 950 + Math.min(1400, text.length * 18));
      }
    }, 22);
  }

  function flowProgressLabel() {
    const flow = activeFlow();
    if (!flow) return `${state.sourceDir}/${state.scriptName}`;
    const scripts = scriptSequenceForFlow(flow);
    const total = scripts.length || flow.scripts.length;
    return `${flow.title} ${state.flowIndex + 1}/${total} · ${state.sourceDir}/${state.scriptName}`;
  }

  function loadSpriteImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = asset(src);
    });
  }

  async function composedSpriteSrc(character) {
    if (!character?.path) return null;
    const faceCandidates = Array.isArray(character.faceCandidates) && character.faceCandidates.length
      ? character.faceCandidates
      : (character.face ? [character.face] : []);
    if (!faceCandidates.length) return asset(character.path);
    const anchor = characterAnchorFor(character.id);
    const key = `${character.path}|${faceCandidates.join("|")}|${character.eyePath || ""}|${JSON.stringify(anchor)}`;
    if (state.spriteCache.has(key)) return state.spriteCache.get(key);

    const body = await loadSpriteImage(character.path);
    let face = null;
    for (const candidate of faceCandidates) {
      try {
        face = await loadSpriteImage(candidate);
        break;
      } catch (_) {
        face = null;
      }
    }
    if (!face) return asset(character.path);
    let eye = null;
    if (character.eyePath) {
      try {
        eye = await loadSpriteImage(character.eyePath);
      } catch (_) {
        eye = null;
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = body.naturalWidth || body.width;
    canvas.height = body.naturalHeight || body.height;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = false;

    const drawLayer = (layer) => {
      if (layer === "body") context.drawImage(body, anchor.body.x, anchor.body.y);
      if (layer === "face") context.drawImage(face, anchor.face.x, anchor.face.y);
      if (layer === "eye" && eye) context.drawImage(eye, anchor.eye.x, anchor.eye.y);
    };
    anchor.drawOrder.forEach(drawLayer);
    const url = canvas.toDataURL("image/png");
    state.spriteCache.set(key, url);
    return url;
  }

  function renderSprite(event) {
    const sprite = spriteFor(event);
    const character = event?.character || null;
    const token = state.spriteRenderToken + 1;
    state.spriteRenderToken = token;
    if (!sprite || !character) {
      nodes.characterSprite.classList.add("hidden");
      nodes.characterSprite.removeAttribute("src");
      return;
    }
    nodes.characterSprite.classList.remove("pos-left", "pos-center", "pos-right");
    nodes.characterSprite.classList.add(`pos-${character.position || "center"}`);
    nodes.characterSprite.onload = () => nodes.characterSprite.classList.remove("hidden");
    nodes.characterSprite.onerror = () => nodes.characterSprite.classList.add("hidden");
    composedSpriteSrc(character).then((src) => {
      if (state.spriteRenderToken !== token || !src) return;
      nodes.characterSprite.src = src;
    }).catch(() => {
      if (state.spriteRenderToken !== token) return;
      nodes.characterSprite.src = asset(sprite);
    });
  }

  function renderCg(event) {
    if (!event?.cg) {
      nodes.cgLayer.classList.add("hidden");
      nodes.cgLayer.removeAttribute("src");
      return;
    }
    nodes.cgLayer.onload = () => nodes.cgLayer.classList.remove("hidden");
    nodes.cgLayer.onerror = () => nodes.cgLayer.classList.add("hidden");
    nodes.cgLayer.src = asset(event.cg);
    unlockGallery(event.cg);
  }

  function currentAnchorCharacter() {
    return currentEvent()?.character || null;
  }

  function anchorJsonText() {
    return JSON.stringify(state.characterAnchors, null, 2);
  }

  function refreshAnchorDebug(event = currentEvent()) {
    if (!nodes.anchorDebug || !state.debugAnchors) return;
    const character = event?.character || null;
    if (!character) {
      nodes.anchorDebugMeta.textContent = "no character";
      nodes.anchorTrace.textContent = (event?.trace || []).join("\n");
      return;
    }
    const anchor = characterAnchorFor(character.id);
    nodes.anchorDebugMeta.textContent = `character_${character.id} body=${character.variant} face=${character.expression} eye=${character.eye || "-"}`;
    nodes.faceXInput.value = anchor.face.x;
    nodes.faceYInput.value = anchor.face.y;
    nodes.eyeXInput.value = anchor.eye.x;
    nodes.eyeYInput.value = anchor.eye.y;
    nodes.anchorTrace.textContent = (event?.trace || []).join("\n") || "(no visual opcode on this line)";
  }

  function setAnchorDebug(open) {
    state.debugAnchors = open;
    nodes.anchorDebug?.classList.toggle("hidden", !open);
    refreshAnchorDebug();
  }

  function applyAnchorDebugInputs() {
    const character = currentAnchorCharacter();
    if (!character) return;
    setCharacterAnchor(character.id, {
      face: { x: Number(nodes.faceXInput.value) || 0, y: Number(nodes.faceYInput.value) || 0 },
      eye: { x: Number(nodes.eyeXInput.value) || 0, y: Number(nodes.eyeYInput.value) || 0 }
    });
    renderEvent();
  }

  async function copyAnchorJson() {
    const text = anchorJsonText();
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      nodes.anchorTrace.textContent = text;
    }
  }

  function downloadAnchorJson() {
    const blob = new Blob([anchorJsonText()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "characterAnchors.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderEvent() {
    const event = state.events[state.eventIndex];
    if (!event) return;
    nodes.backdrop.src = asset(backgroundFor(state.eventIndex, event));
    renderCg(event);
    renderSprite(event);
    applyAudio(event);
    applyEffect(event);
    nodes.sceneLabel.textContent = sceneDisplayLabel(event);
    nodes.speakerName.textContent = event.speaker;
    nodes.lineCounter.textContent = `${state.eventIndex + 1} / ${state.events.length}`;
    nodes.gameScreen.dataset.trace = (event.trace || []).join("\n");
    refreshAnchorDebug(event);
    renderGameState();
    typeText(event.text);
    save();
  }

  function revealOrNext() {
    if (state.choiceOpen) return;
    if (state.typing) {
      stopTyping();
      nodes.dialogue.textContent = state.fullText;
      if (currentEvent()?.choice) setTimeout(() => showInlineChoice(), 80);
      return;
    }
    if (currentEvent()?.choice) {
      showInlineChoice();
      return;
    }
    next();
  }

  function currentFlowScripts() {
    const flow = activeFlow();
    return scriptSequenceForFlow(flow);
  }

  function nextScriptInFlow() {
    const flow = activeFlow();
    const root = rootTableForFlow(state.flowId);
    if (root) {
      const currentCursor = rootCursorForScript(state.flowId, state.scriptName, state.game.rootCursor);
      if (currentCursor < 0) return null;
      const markers = [];
      for (let cursor = currentCursor + 1; cursor < root.length; cursor += 1) {
        const entry = root[cursor];
        if (entry < 0) {
          markers.push(entry);
          continue;
        }
        const name = String(entry);
        if (!state.scriptSet.has(name)) continue;
        return {
          name,
          flowIndex: rootSequenceIndex(root, cursor),
          rootCursor: cursor,
          markers
        };
      }
      return null;
    }
    const scripts = scriptSequenceForFlow(flow);
    if (!scripts.length) return null;
    if (state.flowIndex < scripts.length - 1) {
      return { name: scripts[state.flowIndex + 1], flowIndex: state.flowIndex + 1 };
    }
    return null;
  }

  function next() {
    if (state.eventIndex < state.events.length - 1) {
      state.eventIndex += 1;
      renderEvent();
      return;
    }
    finishScript();
  }

  function prev() {
    if (state.choiceOpen) return;
    if (state.eventIndex > 0) {
      state.eventIndex -= 1;
      renderEvent();
    }
  }

  async function startScript(name, index = 0, options = {}) {
    state.sourceDir = options.sourceDir || "Scripttxt";
    state.scriptName = String(name);
    if (Object.prototype.hasOwnProperty.call(options, "flowId")) state.flowId = options.flowId;
    if (Object.prototype.hasOwnProperty.call(options, "flowIndex")) state.flowIndex = options.flowIndex;
    if (Object.prototype.hasOwnProperty.call(options, "routeId")) state.routeId = options.routeId;
    if (Object.prototype.hasOwnProperty.call(options, "returnTarget")) state.returnTarget = options.returnTarget;
    else state.returnTarget = null;
    if (Object.prototype.hasOwnProperty.call(options, "rootCursor")) state.game.rootCursor = options.rootCursor;
    state.scriptChoicePath = Array.isArray(options.choicePath) ? options.choicePath.map((item) => Number(item)).filter(Number.isFinite) : [];

    const response = await fetch(asset(`${state.sourceDir}/${state.scriptName}`));
    if (!response.ok) throw new Error(`${state.sourceDir}/${state.scriptName} 로드 실패`);
    const buffer = await response.arrayBuffer();
    state.events = applyChoicePath(parseScript(buffer), state.scriptChoicePath);
    state.eventIndex = Math.max(0, Math.min(index, state.events.length - 1));
    closeCenterMenu();
    closeChoices();
    showScreen("game");
    renderEvent();
    save();
  }

  function startFlow(id, flowIndex = 0) {
    const flow = flowById(id);
    if (!flow) return;
    const scripts = scriptSequenceForFlow(flow);
    if (!scripts.length) return;
    const index = Math.max(0, Math.min(flowIndex, scripts.length - 1));
    const rootCursor = rootCursorForScript(id, scripts[index], 0);
    startScript(scripts[index], 0, {
      sourceDir: "Scripttxt",
      flowId: id,
      flowIndex: index,
      routeId: id === "common" || id === "interlude" ? null : id,
      rootCursor: rootCursor >= 0 ? rootCursor : 0
    });
  }

  function playExtra(dir, name) {
    startScript(name, 0, {
      sourceDir: dir,
      flowId: null,
      flowIndex: 0,
      routeId: null
    });
  }

  function showChoices(title, choices) {
    state.choiceOpen = true;
    nodes.choiceTitle.textContent = title;
    nodes.choiceList.textContent = "";
    const fragment = document.createDocumentFragment();
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      if (choice.icon) {
        button.classList.add("has-icon");
        const img = document.createElement("img");
        img.className = "choice-icon";
        img.alt = "";
        img.src = asset(choice.icon);
        button.appendChild(img);
      }
      const copy = document.createElement("span");
      copy.className = "choice-copy";
      const strong = document.createElement("strong");
      strong.textContent = choice.label;
      const span = document.createElement("span");
      span.textContent = choice.meta || "";
      copy.appendChild(strong);
      if (choice.meta) copy.appendChild(span);
      button.appendChild(copy);
      button.addEventListener("click", () => {
        closeChoices();
        choice.action();
      });
      fragment.appendChild(button);
    });
    nodes.choiceList.appendChild(fragment);
    nodes.choiceLayer.classList.remove("hidden");
  }

  function closeChoices() {
    state.choiceOpen = false;
    nodes.choiceLayer.classList.add("hidden");
  }

  function routeChoices() {
    const choices = judgeRoutes().map((candidate) => ({
      label: candidate.available ? candidate.title : `${candidate.title} 조건 부족`,
      meta: candidate.available
        ? `점수 ${candidate.score} · 호감 ${state.game.affection[candidate.heroine]}`
        : `점수 ${candidate.score} · ${candidate.missing.join(", ")}`,
      action: () => {
        if (candidate.available) {
          state.game.chosenRoute = candidate.id;
          state.game.lockedRoute = candidate.id;
          startFlow(candidate.id, 0);
        } else {
          showChoices("조건 부족", [{
            label: "공통 이벤트로 보강",
            meta: "97-99",
            action: () => startFlow("interlude", 0)
          }, {
            label: "강제로 시작",
            meta: "테스트용",
            action: () => startFlow(candidate.id, 0)
          }, {
            label: "진행표",
            meta: "SCENARIO",
            action: openChapters
          }]);
        }
      }
    }));

    if (scriptSequenceForFlow(flowById("interlude")).length) {
      choices.unshift({
        label: "공통 이벤트",
        meta: "97-99",
        action: () => startFlow("interlude", 0)
      });
    }
    return choices;
  }

  function startNextScript(nextFlowScript) {
    startScript(nextFlowScript.name, 0, {
      sourceDir: "Scripttxt",
      flowId: state.flowId,
      flowIndex: nextFlowScript.flowIndex,
      routeId: state.routeId,
      rootCursor: nextFlowScript.rootCursor ?? state.game.rootCursor
    });
  }

  function startDateThenNext(routeId, choice, nextFlowScript) {
    const heroine = routeHeroineIndex(routeId);
    const returnTarget = {
      sourceDir: "Scripttxt",
      name: nextFlowScript.name,
      flowId: state.flowId,
      flowIndex: nextFlowScript.flowIndex,
      routeId: state.routeId,
      rootCursor: nextFlowScript.rootCursor ?? state.game.rootCursor
    };
    const hadDate = heroine >= 0 && (state.game.dateCount[heroine] || 0) > 0;
    const repeatedPlace = heroine >= 0 && state.game.lastDatePlace?.heroine === heroine && state.game.lastDatePlace?.place === choice.place;
    const loveFile = choice.loveNum !== null && choice.loveNum !== undefined ? String(choice.loveNum) : null;
    const playLove = Boolean(
      canOfferConfession(routeId, choice) &&
      loveFile &&
      hasFile("lovetxt", loveFile) &&
      !state.game.flags[`lovePlayed:${routeId}:${loveFile}`]
    );
    applyDateChoice(routeId, choice);
    if (playLove) state.game.flags[`lovePlayed:${routeId}:${loveFile}`] = true;
    const loveTarget = playLove ? {
      sourceDir: "lovetxt",
      name: loveFile,
      flowId: state.flowId,
      flowIndex: state.flowIndex,
      routeId: state.routeId,
      rootCursor: state.game.rootCursor,
      returnTarget
    } : returnTarget;
    const dateTarget = choice.file ? {
      sourceDir: "datetxt",
      name: choice.file,
      flowId: state.flowId,
      flowIndex: state.flowIndex,
      routeId: state.routeId,
      rootCursor: state.game.rootCursor,
      returnTarget: loveTarget
    } : loveTarget;
    const prelude = repeatedPlace && hasFile("dateoverlaptxt", String(heroine))
      ? { sourceDir: "dateoverlaptxt", name: String(heroine) }
      : !hadDate && hasFile("dateintro", String(heroine))
        ? { sourceDir: "dateintro", name: String(heroine) }
        : null;
    if (prelude) {
      startScript(prelude.name, 0, {
        sourceDir: prelude.sourceDir,
        flowId: state.flowId,
        flowIndex: state.flowIndex,
        routeId: state.routeId,
        rootCursor: state.game.rootCursor,
        returnTarget: dateTarget
      });
      return;
    }
    if (choice.file) {
      startScript(dateTarget.name, 0, dateTarget);
      return;
    }
    startScript(dateTarget.name, 0, dateTarget);
  }

  function startConditionalEvent(event, nextFlowScript) {
    addUnique(state.game.seenStateEvents, event.name);
    state.game.flags[`stateevent:${event.name}`] = true;
    state.game.lastAction = event.label;
    save();
    startScript(event.name, 0, {
      sourceDir: event.dir,
      flowId: state.flowId,
      flowIndex: state.flowIndex,
      routeId: state.routeId,
      rootCursor: state.game.rootCursor,
      returnTarget: {
        sourceDir: "Scripttxt",
        name: nextFlowScript.name,
        flowId: state.flowId,
        flowIndex: nextFlowScript.flowIndex,
        routeId: state.routeId,
        rootCursor: nextFlowScript.rootCursor ?? state.game.rootCursor
      }
    });
  }

  function nextChoices(nextFlowScript) {
    const choices = [];
    const routeId = state.routeId || state.flowId;
    const markers = nextFlowScript.markers || [];
    const wantsWeekAction = markers.includes(-2) || (!markers.length && isWeekendCheckpoint());
    const wantsDate = markers.includes(-3) && dateTableForRoute(routeId);
    const stateEvent = pendingStateEvent(routeId);

    if (stateEvent) {
      choices.push({
        label: stateEvent.label,
        meta: `${stateEvent.meta} · ${stateEvent.dir}/${stateEvent.name}`,
        action: () => startConditionalEvent(stateEvent, nextFlowScript)
      });
    }

    if (wantsWeekAction) {
      WEEK_ACTIONS.forEach((action) => {
        choices.push({
          label: action.label,
          meta: `${action.meta} · ${ROOT_MARKERS["-2"]}`,
          action: () => {
            applyWeekAction(action.id);
            startNextScript(nextFlowScript);
          }
        });
      });
    }

    if (wantsDate) {
      dateCandidatesForRoute(routeId).forEach((choice) => {
        const confession = canOfferConfession(routeId, choice)
          ? " · 고백 가능"
          : choice.place === 13
            ? ` · 고백 부족: ${confessionStatus(routeId).missing.join(", ")}`
            : "";
        choices.push({
          label: choice.label,
          meta: `${choice.meta}${confession}`,
          action: () => startDateThenNext(routeId, choice, nextFlowScript)
        });
      });
    }

    choices.push({
      label: "다음 장",
      meta: `${formatDate()} · ${markerSummary(markers)} · Scripttxt/${nextFlowScript.name}`,
      action: () => startNextScript(nextFlowScript)
    }, {
      label: "진행표",
      meta: "SCENARIO",
      action: openChapters
    }, {
      label: "저장 후 메뉴",
      meta: "SAVE",
      action: () => {
        save();
        openCenterMenu();
      }
    });
    return choices;
  }

  function postEndingChoices(flow) {
    const choices = [];
    if (isAfterUnlocked(flow)) {
      choices.push({
        label: "애프터 스토리",
        meta: `after/${flow.after}`,
        action: () => playExtra("after", flow.after)
      });
    }
    choices.push({
      label: "진행표",
      meta: "SCENARIO",
      action: openChapters
    }, {
      label: "타이틀",
      meta: "TITLE",
      action: () => showScreen("title")
    });
    return choices;
  }

  function endingChoices(flow) {
    const result = resolveEnding(flow.id);
    const rule = ENDING_RULES[flow.id];
    const openId = endingOpenId(flow.id, result.kind);
    const afterWillOpen = checkAfterStoryOpenOriginal(flow.id, result.kind);
    const missing = result.status.missing.length
      ? result.status.missing.join(", ")
      : state.game.confession?.[flow.id] ? "조건 충족" : "고백 플래그";
    const primary = result.kind === "good"
      ? { label: "굿 엔딩 확정", meta: `${flow.title} 클리어 · 원작 엔딩 ID ${openId}${afterWillOpen ? " · 애프터 해금" : ""}`, dir: null, file: null }
      : result.kind === "normal"
        ? { label: "노멀 엔딩", meta: `원작 엔딩 ID ${openId} · 부족: ${missing}`, dir: "normaltxt", file: rule.normal }
        : { label: "배드 엔딩", meta: `부족: ${missing}`, dir: "badscript", file: rule.bad };

    const choices = [{
      label: primary.label,
      meta: primary.file ? `${primary.meta} · ${primary.dir}/${primary.file}` : primary.meta,
      action: () => {
        markEnding(flow.id, result.kind);
        if (primary.file && hasFile(primary.dir, primary.file)) {
          playExtra(primary.dir, primary.file);
          return;
        }
        showChoices(result.kind === "good" ? "CLEAR" : "END", postEndingChoices(flow));
      }
    }, {
      label: "조건 확인",
      meta: `호감 ${state.game.affection[rule.heroine]} / 데이트 ${state.game.dateCount[rule.heroine]} / ${missing}`,
      action: () => showChoices("ENDING CHECK", postEndingChoices(flow))
    }];
    return choices;
  }

  function finishScript() {
    recordScriptCompletion();
    if (state.returnTarget) {
      const target = state.returnTarget;
      state.returnTarget = null;
      startScript(target.name, 0, {
        sourceDir: target.sourceDir || "Scripttxt",
        flowId: target.flowId,
        flowIndex: target.flowIndex,
        routeId: target.routeId,
        rootCursor: target.rootCursor ?? state.game.rootCursor,
        returnTarget: target.returnTarget ?? null
      });
      return;
    }
    const nextFlowScript = nextScriptInFlow();
    if (nextFlowScript) {
      if (state.auto && !(nextFlowScript.markers || []).length) {
        setTimeout(() => startNextScript(nextFlowScript), 800);
        return;
      }
      showChoices(markerSummary(nextFlowScript.markers), nextChoices(nextFlowScript));
      return;
    }

    const flow = activeFlow();
    if (flow && ENDING_RULES[flow.id]) {
      showChoices("ENDING", endingChoices(flow));
      return;
    }

    if (flow && flow.next === "route-select") {
      showChoices("ROUTE", routeChoices());
      return;
    }

    const choices = [{
      label: "진행표",
      meta: "SCENARIO",
      action: openChapters
    }, {
      label: "타이틀",
      meta: "TITLE",
      action: () => showScreen("title")
    }];
    if (flow && isAfterUnlocked(flow)) {
      choices.unshift({
        label: "애프터 스토리",
        meta: `after/${flow.after}`,
        action: () => playExtra("after", flow.after)
      });
    }
    showChoices("END", choices);
  }

  function openCenterMenu() {
    state.menuOpen = true;
    nodes.centerMenu.classList.remove("hidden");
  }

  function closeCenterMenu() {
    state.menuOpen = false;
    nodes.centerMenu.classList.add("hidden");
  }

  function makeCard(title, meta, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chapter-card";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = meta;
    button.appendChild(strong);
    button.appendChild(span);
    button.addEventListener("click", action);
    return button;
  }

  function openChapters() {
    nodes.browserTitle.textContent = "SCENARIO";
    nodes.chapterList.classList.remove("hidden");
    nodes.galleryGrid.classList.add("hidden");
    nodes.chapterList.textContent = "";
    const fragment = document.createDocumentFragment();

    STORY_FLOWS.forEach((flow) => {
      const scripts = scriptSequenceForFlow(flow);
      if (!scripts.length) return;
      fragment.appendChild(makeCard(flow.title, `${scripts[0]}-${scripts[scripts.length - 1]}`, () => startFlow(flow.id, 0)));
    });

    EXTRA_SETS.forEach((set) => {
      const files = state.fileIndex.get(set.dir) || [];
      if (!files.length) return;
      fragment.appendChild(makeCard(set.title, `${set.dir}/${files[0]}`, () => openExtraSet(set)));
    });

    sortNumeric(state.manifest.scripts).forEach((name) => {
      fragment.appendChild(makeCard(`Scripttxt/${name}`, "START", () => startScript(name, 0, {
        sourceDir: "Scripttxt",
        flowId: null,
        flowIndex: 0,
        routeId: null
      })));
    });

    nodes.chapterList.appendChild(fragment);
    showScreen("browser");
  }

  function openExtraSet(set) {
    nodes.browserTitle.textContent = set.title;
    nodes.chapterList.classList.remove("hidden");
    nodes.galleryGrid.classList.add("hidden");
    nodes.chapterList.textContent = "";
    const fragment = document.createDocumentFragment();
    (state.fileIndex.get(set.dir) || []).forEach((name) => {
      fragment.appendChild(makeCard(`${set.dir}/${name}`, "PLAY", () => playExtra(set.dir, name)));
    });
    nodes.chapterList.appendChild(fragment);
    showScreen("browser");
  }

  function openGallery() {
    nodes.browserTitle.textContent = "GALLERY";
    nodes.chapterList.classList.add("hidden");
    nodes.galleryGrid.classList.remove("hidden");
    nodes.galleryGrid.textContent = "";
    const fragment = document.createDocumentFragment();
    const unlocked = new Set(state.game.unlockedGallery || []);
    const media = state.cgPaths.length ? state.cgPaths : state.illust;
    media.forEach((path) => {
      const isUnlocked = unlocked.has(path) || Boolean(state.game.flags[`gallery:${path}`]);
      const button = document.createElement("button");
      button.type = "button";
      button.className = isUnlocked ? "thumb" : "thumb locked";
      const label = document.createElement("span");
      if (isUnlocked) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.src = asset(path);
        button.appendChild(img);
        label.textContent = path.split("/").pop();
      } else {
        const locked = document.createElement("div");
        locked.className = "locked-thumb";
        locked.textContent = "LOCKED";
        button.appendChild(locked);
        label.textContent = "???";
      }
      button.appendChild(label);
      button.addEventListener("click", () => {
        if (!isUnlocked) return;
        showScreen("game");
        closeCenterMenu();
        closeChoices();
        nodes.cgLayer.src = asset(path);
        nodes.cgLayer.classList.remove("hidden");
      });
      fragment.appendChild(button);
    });
    nodes.galleryGrid.appendChild(fragment);
    showScreen("browser");
  }

  function continueGame() {
    const saved = loadSave();
    if (saved && saved.scriptName) {
      state.game = copyGameState(saved.game);
      startScript(saved.scriptName, saved.eventIndex || 0, {
        sourceDir: saved.sourceDir || "Scripttxt",
        flowId: saved.flowId ?? null,
        flowIndex: saved.flowIndex || 0,
        routeId: saved.routeId ?? null,
        returnTarget: saved.returnTarget ?? null,
        choicePath: Array.isArray(saved.choicePath) ? saved.choicePath : [],
        rootCursor: saved.game?.rootCursor ?? 0
      });
    } else {
      startFlow("common", 0);
    }
  }

  function bind() {
    document.addEventListener("pointerdown", unlockAudio, { passive: true });
    document.addEventListener("keydown", unlockAudio);
    $("startBtn").addEventListener("click", () => {
      resetGameState();
      startFlow("common", 0);
    });
    $("continueBtn").addEventListener("click", continueGame);
    $("chapterBtn").addEventListener("click", openChapters);
    $("galleryBtn").addEventListener("click", openGallery);
    $("homeBtn").addEventListener("click", () => {
      if (state.menuOpen) closeCenterMenu();
      else openCenterMenu();
    });
    $("autoBtn").addEventListener("click", () => {
      state.auto = !state.auto;
      nodes.autoBtn.classList.toggle("active", state.auto);
      if (state.auto && !state.typing) next();
    });
    $("textBox").addEventListener("click", revealOrNext);
    $("prevBtn").addEventListener("click", prev);
    $("playBtn").addEventListener("click", revealOrNext);
    $("skipBtn").addEventListener("click", () => {
      if (state.typing) {
        stopTyping();
        nodes.dialogue.textContent = state.fullText;
        return;
      }
      next();
    });
    $("quickBtn").addEventListener("click", () => {
      save();
      state.game.lastAction = "\ud034\uc138\uc774\ube0c";
      renderGameState();
    });
    $("loveBtn").addEventListener("click", () => {
      if (state.menuOpen) closeCenterMenu();
      else openCenterMenu();
    });
    $("popBtn").addEventListener("click", () => {
      nodes.gameScreen.classList.toggle("show-state");
    });
    $("resumeBtn").addEventListener("click", closeCenterMenu);
    $("saveBtn").addEventListener("click", () => {
      save();
      closeCenterMenu();
    });
    $("openChaptersBtn").addEventListener("click", openChapters);
    $("openGalleryBtn").addEventListener("click", openGallery);
    $("titleFromMenuBtn").addEventListener("click", () => showScreen("title"));
    $("browserBackBtn").addEventListener("click", () => showScreen(state.events.length ? "game" : "title"));
    nodes.anchorCloseBtn?.addEventListener("click", () => setAnchorDebug(false));
    nodes.anchorApplyBtn?.addEventListener("click", applyAnchorDebugInputs);
    nodes.anchorCopyBtn?.addEventListener("click", copyAnchorJson);
    nodes.anchorDownloadBtn?.addEventListener("click", downloadAnchorJson);
    [nodes.faceXInput, nodes.faceYInput, nodes.eyeXInput, nodes.eyeYInput].forEach((input) => {
      input?.addEventListener("change", applyAnchorDebugInputs);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight" || event.key === " ") revealOrNext();
      if (event.key.toLowerCase() === "d" && event.shiftKey) setAnchorDebug(!state.debugAnchors);
      if (event.key === "Escape") {
        if (state.choiceOpen) closeChoices();
        else openCenterMenu();
      }
    });
  }

  function hydrateFileIndex(manifest) {
    const optional = manifest.files || {};
    Object.entries(optional).forEach(([dir, files]) => {
      if (Array.isArray(files)) state.fileIndex.set(dir, sortNumeric(files));
    });
    EXTRA_SETS.forEach((set) => {
      const files = sortNumeric(optional[set.dir] || []);
      state.fileIndex.set(set.dir, files);
    });
    state.fileIndex.set("sound", sortNumeric(optional.sound || []));
  }

  async function loadCharacterAnchors() {
    let anchors = {};
    try {
      const response = await fetch("data/characterAnchors.json");
      if (response.ok) anchors = await response.json();
    } catch (_) {
      anchors = {};
    }
    try {
      const local = JSON.parse(localStorage.getItem("snowrain.characterAnchors") || "null");
      if (local && typeof local === "object") anchors = { ...anchors, ...local };
    } catch (_) {
      // Ignore malformed local anchor edits.
    }
    state.characterAnchors = anchors;
  }

  async function init() {
    const response = await fetch("manifest.json");
    state.manifest = await response.json();
    await loadCharacterAnchors();
    state.backgrounds = sortNumeric(state.manifest.backgrounds || []);
    state.illust = sortNumeric(state.manifest.illust || []);
    state.backgroundSet = new Set(state.backgrounds);
    state.mediaIndex = new Map();
    const mediaManifest = state.manifest.media || {};
    VISUAL_MEDIA_DIRS.forEach((dir) => {
      const legacyKey = dir === "Illuster" ? "illust" : dir.charAt(0).toLowerCase() + dir.slice(1);
      const files = sortNumeric(mediaManifest[dir] || state.manifest[legacyKey] || []);
      state.mediaIndex.set(dir, files);
    });
    state.cgPaths = VISUAL_MEDIA_DIRS.flatMap((dir) => state.mediaIndex.get(dir) || []);
    state.soundPaths = sortNumeric(state.manifest.sounds || (state.manifest.files?.sound || []).map((name) => `sound/${name}`));
    state.characterMap = state.manifest.characters || {};
    state.loveModeTable = state.manifest.lovemode || {};
    state.scriptSet = new Set((state.manifest.scripts || []).map(String));
    hydrateFileIndex(state.manifest);
    nodes.titleBg.src = asset(state.manifest.title.background);
    nodes.titleLogo.src = asset(state.manifest.title.logo);
    nodes.backdrop.src = asset(state.manifest.title.background);
    bind();
    renderGameState();
    showScreen("title");
  }

  window.SnowRain = {
    back() {
      if (state.screen === "browser") {
        showScreen(state.events.length ? "game" : "title");
      } else if (state.screen === "game") {
        if (state.choiceOpen) closeChoices();
        else if (state.menuOpen) closeCenterMenu();
        else openCenterMenu();
      }
    },
    trace() {
      return [...state.scriptTrace];
    },
    anchors() {
      return JSON.parse(anchorJsonText());
    },
    debugAnchors(open = true) {
      setAnchorDebug(Boolean(open));
    }
  };

  init().catch((error) => {
    nodes.dialogue.textContent = error && error.message ? error.message : String(error);
    showScreen("game");
  });
})();
