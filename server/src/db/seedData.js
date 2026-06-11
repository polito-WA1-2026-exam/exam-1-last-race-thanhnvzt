export const seedUsers = [
  {
    username: 'user1',
    name: 'Alice',
    password: 'password',
    salt: 'last-race-alice-salt',
  },
  {
    username: 'user2',
    name: 'Bianca',
    password: 'password',
    salt: 'last-race-bianca-salt',
  },
  {
    username: 'user3',
    name: 'Carlo',
    password: 'password',
    salt: 'last-race-carlo-salt',
  },
];

export const seedStations = [
  { name: 'Noi Bai Airport', x: 310, y: 50 },
  { name: 'Phu Minh', x: 455, y: 95 },
  { name: 'Co Nhue', x: 250, y: 165 },
  { name: 'West Lake', x: 365, y: 205 },
  { name: 'Cau Giay', x: 315, y: 290 },
  { name: 'Cat Linh', x: 395, y: 325 },
  { name: 'Ha Noi Station', x: 455, y: 355 },
  { name: 'Long Bien', x: 545, y: 310 },
  { name: 'Yen Vien', x: 650, y: 245 },
  { name: 'Ngoc Hoi', x: 455, y: 460 },
  { name: 'Giap Bat', x: 455, y: 410 },
  { name: 'Ha Dong', x: 215, y: 420 },
  { name: 'An Khanh', x: 90, y: 395 },
  { name: 'Nhon', x: 115, y: 285 },
  { name: 'Troi', x: 40, y: 250 },
  { name: 'Yen So', x: 505, y: 430 },
  { name: 'Co Loa', x: 635, y: 140 },
  { name: 'Trau Quy', x: 670, y: 355 },
];

export const seedLines = [
  {
    name: 'Line 1 (Ngoc Hoi - Yen Vien)',
    color: '#2f6fde',
    stations: ['Ngoc Hoi', 'Giap Bat', 'Ha Noi Station', 'Long Bien', 'Yen Vien'],
  },
  {
    name: 'Line 2 (Ha Dong - Noi Bai)',
    color: '#3fae49',
    stations: ['Ha Dong', 'Cau Giay', 'West Lake', 'Phu Minh', 'Noi Bai Airport'],
  },
  {
    name: 'Line 2A (Cat Linh - Ha Dong)',
    color: '#f0d529',
    stations: ['Cat Linh', 'Cau Giay', 'Ha Dong'],
  },
  {
    name: 'Line 3 (Troi - Nhon - Yen So)',
    color: '#d9342b',
    stations: ['Troi', 'Nhon', 'Cau Giay', 'Cat Linh', 'Ha Noi Station', 'Yen So'],
  },
  {
    name: 'Line 5 (Co Loa - An Khanh)',
    color: '#f28c28',
    stations: ['Co Loa', 'Long Bien', 'Ha Noi Station', 'Cau Giay', 'An Khanh'],
  },
  {
    name: 'Line 8 (Co Nhue - Trau Quy)',
    color: '#d65aa5',
    stations: ['Co Nhue', 'West Lake', 'Long Bien', 'Trau Quy'],
  },
];

export const seedEvents = [
  { description: 'Quiet journey', effect: 0 },
  { description: 'Found a dropped token', effect: 1 },
  { description: 'Helpful passenger shares a shortcut', effect: 2 },
  { description: 'Express train arrives early', effect: 3 },
  { description: 'Station musician inspires the trip', effect: 4 },
  { description: 'Crowded carriage slows the trip', effect: -1 },
  { description: 'Wrong platform delay', effect: -2 },
  { description: 'Ticket inspection surcharge', effect: -3 },
  { description: 'Missed connection', effect: -4 },
];

export const seedHistoricalGames = [
  {
    username: 'user1',
    status: 'executed',
    start: 'Troi',
    destination: 'Yen Vien',
    startedAt: '2026-05-01T10:00:00.000Z',
    planningDeadline: '2026-05-01T10:01:30.000Z',
    submittedAt: '2026-05-01T10:01:05.000Z',
    finalCoins: 21,
    score: 21,
    steps: [
      { from: 'Troi', to: 'Nhon', line: 'Line 3 (Troi - Nhon - Yen So)', event: 'Found a dropped token', coinsAfterStep: 21 },
      { from: 'Nhon', to: 'Cau Giay', line: 'Line 3 (Troi - Nhon - Yen So)', event: 'Quiet journey', coinsAfterStep: 21 },
      { from: 'Cau Giay', to: 'Cat Linh', line: 'Line 3 (Troi - Nhon - Yen So)', event: 'Wrong platform delay', coinsAfterStep: 19 },
      { from: 'Cat Linh', to: 'Ha Noi Station', line: 'Line 3 (Troi - Nhon - Yen So)', event: 'Helpful passenger shares a shortcut', coinsAfterStep: 21 },
      { from: 'Ha Noi Station', to: 'Long Bien', line: 'Line 1 (Ngoc Hoi - Yen Vien)', event: 'Quiet journey', coinsAfterStep: 21 },
      { from: 'Long Bien', to: 'Yen Vien', line: 'Line 1 (Ngoc Hoi - Yen Vien)', event: 'Quiet journey', coinsAfterStep: 21 },
    ],
  },
  {
    username: 'user2',
    status: 'executed',
    start: 'Noi Bai Airport',
    destination: 'Ha Dong',
    startedAt: '2026-05-02T11:00:00.000Z',
    planningDeadline: '2026-05-02T11:01:30.000Z',
    submittedAt: '2026-05-02T11:00:48.000Z',
    finalCoins: 24,
    score: 24,
    steps: [
      { from: 'Noi Bai Airport', to: 'Phu Minh', line: 'Line 2 (Ha Dong - Noi Bai)', event: 'Express train arrives early', coinsAfterStep: 23 },
      { from: 'Phu Minh', to: 'West Lake', line: 'Line 2 (Ha Dong - Noi Bai)', event: 'Quiet journey', coinsAfterStep: 23 },
      { from: 'West Lake', to: 'Cau Giay', line: 'Line 2 (Ha Dong - Noi Bai)', event: 'Found a dropped token', coinsAfterStep: 24 },
      { from: 'Cau Giay', to: 'Ha Dong', line: 'Line 2 (Ha Dong - Noi Bai)', event: 'Quiet journey', coinsAfterStep: 24 },
    ],
  },
];
