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
  { name: 'Aurora Gate', x: 80, y: 120 },
  { name: 'Museum Square', x: 220, y: 120 },
  { name: 'Central Spire', x: 360, y: 120 },
  { name: 'Harbor Market', x: 500, y: 120 },
  { name: 'West Garden', x: 640, y: 120 },
  { name: 'North Library', x: 360, y: 40 },
  { name: 'Glassworks', x: 470, y: 250 },
  { name: 'River Forum', x: 360, y: 360 },
  { name: 'South Arena', x: 640, y: 360 },
  { name: 'Old Foundry', x: 220, y: 260 },
  { name: 'Hill Observatory', x: 500, y: 430 },
  { name: 'East Depot', x: 640, y: 430 },
  { name: 'Clocktower', x: 640, y: 250 },
  { name: 'Canal Court', x: 80, y: 260 },
];

export const seedLines = [
  {
    name: 'Red Line',
    color: '#d64545',
    stations: ['Aurora Gate', 'Museum Square', 'Central Spire', 'Harbor Market', 'West Garden'],
  },
  {
    name: 'Blue Line',
    color: '#2f6fde',
    stations: ['North Library', 'Central Spire', 'Glassworks', 'River Forum', 'South Arena'],
  },
  {
    name: 'Green Line',
    color: '#2f8f5b',
    stations: ['Museum Square', 'Old Foundry', 'River Forum', 'Hill Observatory', 'East Depot'],
  },
  {
    name: 'Gold Line',
    color: '#c9971a',
    stations: ['West Garden', 'Clocktower', 'Glassworks', 'East Depot', 'South Arena'],
  },
  {
    name: 'Violet Line',
    color: '#7c4dff',
    stations: ['Canal Court', 'Old Foundry', 'Central Spire', 'Clocktower'],
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
    start: 'Aurora Gate',
    destination: 'South Arena',
    startedAt: '2026-05-01T10:00:00.000Z',
    planningDeadline: '2026-05-01T10:01:30.000Z',
    submittedAt: '2026-05-01T10:01:05.000Z',
    finalCoins: 21,
    score: 21,
    steps: [
      { from: 'Aurora Gate', to: 'Museum Square', line: 'Red Line', event: 'Found a dropped token', coinsAfterStep: 21 },
      { from: 'Museum Square', to: 'Central Spire', line: 'Red Line', event: 'Quiet journey', coinsAfterStep: 21 },
      { from: 'Central Spire', to: 'Glassworks', line: 'Blue Line', event: 'Wrong platform delay', coinsAfterStep: 19 },
      { from: 'Glassworks', to: 'River Forum', line: 'Blue Line', event: 'Helpful passenger shares a shortcut', coinsAfterStep: 21 },
      { from: 'River Forum', to: 'South Arena', line: 'Blue Line', event: 'Quiet journey', coinsAfterStep: 21 },
    ],
  },
  {
    username: 'user2',
    status: 'executed',
    start: 'North Library',
    destination: 'East Depot',
    startedAt: '2026-05-02T11:00:00.000Z',
    planningDeadline: '2026-05-02T11:01:30.000Z',
    submittedAt: '2026-05-02T11:00:48.000Z',
    finalCoins: 24,
    score: 24,
    steps: [
      { from: 'North Library', to: 'Central Spire', line: 'Blue Line', event: 'Express train arrives early', coinsAfterStep: 23 },
      { from: 'Central Spire', to: 'Glassworks', line: 'Blue Line', event: 'Quiet journey', coinsAfterStep: 23 },
      { from: 'Glassworks', to: 'East Depot', line: 'Gold Line', event: 'Found a dropped token', coinsAfterStep: 24 },
    ],
  },
];
