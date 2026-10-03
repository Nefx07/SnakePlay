// Central tuning values. Everything else reads from here so the game can be
// rebalanced without touching the logic.

const CONFIG = {
  gridSize: 20,
  cellSize: 24,
  startLength: 3,
  pointsPerFood: 10,
  startTickMs: 150,
  fastestTickMs: 70,
  tickStepMs: 5,
  storageKey: 'stardance-snake:best',
  colors: {
    background: '#14161a',
    gridLine: '#20242c',
    snakeHead: '#4ade80',
    snakeBody: '#2e9c58',
    food: '#f87171'
  }
};

const GAME_STATE = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over',
  WON: 'won'
};
