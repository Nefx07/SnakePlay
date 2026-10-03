// Tests for the game rules. Open tests.html in a browser to run them.
//
// The rules live in plain classes with no DOM or timer dependencies, so they
// can be exercised directly by calling methods instead of waiting for ticks.

const testResults = [];

function test(name, run) {
  try {
    run();
    testResults.push({ name, passed: true, message: '' });
  } catch (error) {
    testResults.push({ name, passed: false, message: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message} (expected ${expected}, got ${actual})`);
  }
}

function createGame() {
  return new Game({
    renderer: { render() {} },
    onScoreChange() {},
    onStateChange() {}
  });
}

// ---------------------------------------------------------------- the snake

test('the snake starts at the middle of the board', () => {
  const snake = new Snake();
  const middle = Math.floor(CONFIG.gridSize / 2);

  assertEqual(snake.length, CONFIG.startLength, 'starting length');
  assertEqual(snake.head.x, middle, 'head x');
  assertEqual(snake.head.y, middle, 'head y');
});

test('a 180 degree turn is refused', () => {
  const snake = new Snake();

  assertEqual(snake.steer(DIRECTIONS.left), false, 'left should be refused');
  assertEqual(snake.queuedDirection, DIRECTIONS.right, 'direction must not change');
});

test('two quick turns cannot add up to a 180 degree turn', () => {
  const snake = new Snake();

  assertEqual(snake.steer(DIRECTIONS.up), true, 'up should be accepted');
  assertEqual(snake.steer(DIRECTIONS.left), false, 'left must still be refused');
  assertEqual(snake.queuedDirection, DIRECTIONS.up, 'the queued turn must survive');
});

test('stepping moves the head one cell and keeps the length', () => {
  const snake = new Snake();
  const startX = snake.head.x;

  snake.step();

  assertEqual(snake.head.x, startX + 1, 'head should move right');
  assertEqual(snake.length, CONFIG.startLength, 'length should not change');
});

test('a queued turn is applied on the next step', () => {
  const snake = new Snake();
  const startY = snake.head.y;

  snake.steer(DIRECTIONS.up);
  snake.step();

  assertEqual(snake.head.y, startY - 1, 'head should move up');
});

test('getNextHead predicts the landing cell without moving', () => {
  const snake = new Snake();
  const before = snake.head.x;
  const predicted = snake.getNextHead();

  assertEqual(predicted.x, before + 1, 'prediction should be one cell right');
  assertEqual(snake.head.x, before, 'the snake must not have moved');
});

test('leaving the board is detected on both axes', () => {
  const snake = new Snake();

  assert(snake.isOutside({ x: -1, y: 5 }), 'left edge');
  assert(snake.isOutside({ x: CONFIG.gridSize, y: 5 }), 'right edge');
  assert(snake.isOutside({ x: 5, y: -1 }), 'top edge');
  assert(snake.isOutside({ x: 5, y: CONFIG.gridSize }), 'bottom edge');
  assert(!snake.isOutside({ x: 0, y: 0 }), 'corner is inside');
  assert(!snake.isOutside({ x: CONFIG.gridSize - 1, y: CONFIG.gridSize - 1 }), 'far corner is inside');
});

test('the head cannot enter its own body', () => {
  const snake = new Snake();
  snake.segments = [
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 5 },
    { x: 6, y: 4 }
  ];
  snake.direction = DIRECTIONS.right;
  snake.queuedDirection = DIRECTIONS.down;

  assert(snake.wouldBite(snake.getNextHead()), 'the body cell must block');
});

test('the tail cell is safe to enter unless the snake is growing', () => {
  const snake = new Snake();
  snake.segments = [
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 5 },
    { x: 5, y: 5 }
  ];
  snake.direction = DIRECTIONS.right;
  snake.queuedDirection = DIRECTIONS.down;

  assert(!snake.wouldBite(snake.getNextHead()), 'the tail is vacated on this step');

  snake.grow();
  assert(snake.wouldBite(snake.getNextHead()), 'a growing snake keeps its tail');
});

test('a longer snake ends up one cell longer after eating and moving', () => {
  const snake = new Snake();
  const startLength = snake.length;

  snake.grow();
  snake.step();

  assertEqual(snake.length, startLength + 1, 'length should grow by one');
});
// ---------------------------------------------------------------- the food

test('food never lands on the snake', () => {
  const snake = new Snake();

  for (let index = 0; index < 60; index += 1) {
    snake.segments.push({
      x: index % CONFIG.gridSize,
      y: Math.floor(index / CONFIG.gridSize)
    });
  }

  const food = new Food();

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const cell = food.respawn(snake);
    assert(cell !== null, 'a free cell should always be found');
    assert(!snake.occupies(cell.x, cell.y), 'food must not sit on the snake');
  }
});

test('a completely full board has nowhere to put food', () => {
  const snake = new Snake();
  snake.segments = [];

  for (let y = 0; y < CONFIG.gridSize; y += 1) {
    for (let x = 0; x < CONFIG.gridSize; x += 1) {
      snake.segments.push({ x, y });
    }
  }

  const food = new Food();

  assertEqual(food.respawn(snake), null, 'respawn should report the board is full');
  assertEqual(food.position, null, 'position should be cleared');
});

// ---------------------------------------------------------------- the rules

test('eating scores, queues growth and speeds the game up', () => {
  const game = createGame();
  game.state = GAME_STATE.RUNNING;

  const startLength = game.snake.length;
  const startTick = game.tickMs;
  game.food.position = game.snake.getNextHead();

  game.advanceSnake();

  assertEqual(game.score, CONFIG.pointsPerFood, 'score should rise by one pellet');
  assert(game.tickMs < startTick, 'the tick should get faster');
  assertEqual(game.snake.length, startLength, 'growth lands on the following step');

  game.food.position = null;
  game.advanceSnake();

  assertEqual(game.snake.length, startLength + 1, 'the snake should now be one longer');
});

test('running into a wall ends the run and leaves the head on the board', () => {
  const game = createGame();
  game.state = GAME_STATE.RUNNING;

  const last = CONFIG.gridSize - 1;
  game.snake.segments = [
    { x: last, y: 5 },
    { x: last - 1, y: 5 },
    { x: last - 2, y: 5 }
  ];
  game.snake.direction = DIRECTIONS.right;
  game.snake.queuedDirection = DIRECTIONS.right;

  game.advanceSnake();

  assertEqual(game.state, GAME_STATE.OVER, 'the run should be over');
  assertEqual(game.snake.head.x, last, 'the head must stay inside the board');
});

test('the run ends without moving when the next cell is fatal', () => {
  const game = createGame();
  game.state = GAME_STATE.RUNNING;

  const last = CONFIG.gridSize - 1;
  game.snake.segments = [
    { x: last, y: 5 },
    { x: last - 1, y: 5 },
    { x: last - 2, y: 5 }
  ];
  game.snake.direction = DIRECTIONS.right;
  game.snake.queuedDirection = DIRECTIONS.right;

  game.advanceSnake();

  assertEqual(game.snake.length, 3, 'the fail state must not add a segment');
});

test('the best score is banked when a run ends', () => {
  const game = createGame();
  game.state = GAME_STATE.RUNNING;
  game.score = 120;
  game.bestScore = 0;

  game.finish(GAME_STATE.OVER);

  assertEqual(game.bestScore, 120, 'best score should be updated');
});

test('pause stops the clock and resume starts it again', () => {
  const game = createGame();

  game.start();
  assertEqual(game.state, GAME_STATE.RUNNING, 'start should run the game');
  assert(game.timerId !== null, 'a tick should be queued');

  game.togglePause();
  assertEqual(game.state, GAME_STATE.PAUSED, 'pause should hold');
  assertEqual(game.timerId, null, 'the timer must be cleared while paused');

  game.togglePause();
  assertEqual(game.state, GAME_STATE.RUNNING, 'resume should run again');
  assert(game.timerId !== null, 'a tick should be queued again');

  game.stopTimer();
});

test('restart clears the score and returns to the start screen', () => {
  const game = createGame();
  game.score = 50;
  game.tickMs = CONFIG.fastestTickMs;

  game.restart();

  assertEqual(game.score, 0, 'score should reset');
  assertEqual(game.tickMs, CONFIG.startTickMs, 'speed should reset');
  assertEqual(game.state, GAME_STATE.IDLE, 'state should be idle');
  assert(game.food.position !== null, 'food should be placed');
  assert(!game.snake.occupies(game.food.position.x, game.food.position.y), 'food must not sit on the snake');
});

test('starting a finished game begins a fresh run', () => {
  const game = createGame();
  game.state = GAME_STATE.OVER;
  game.score = 90;

  game.start();

  assertEqual(game.state, GAME_STATE.RUNNING, 'state should be running');
  assertEqual(game.score, 0, 'score should be cleared');

  game.stopTimer();
});

// ---------------------------------------------------------------- the input

test('every movement key maps to a direction', () => {
  assertEqual(KEY_TO_DIRECTION.ArrowUp, DIRECTIONS.up, 'ArrowUp');
  assertEqual(KEY_TO_DIRECTION.ArrowDown, DIRECTIONS.down, 'ArrowDown');
  assertEqual(KEY_TO_DIRECTION.ArrowLeft, DIRECTIONS.left, 'ArrowLeft');
  assertEqual(KEY_TO_DIRECTION.ArrowRight, DIRECTIONS.right, 'ArrowRight');
  assertEqual(KEY_TO_DIRECTION.w, DIRECTIONS.up, 'w');
  assertEqual(KEY_TO_DIRECTION.s, DIRECTIONS.down, 's');
  assertEqual(KEY_TO_DIRECTION.a, DIRECTIONS.left, 'a');
  assertEqual(KEY_TO_DIRECTION.d, DIRECTIONS.right, 'd');
  assertEqual(KEY_TO_DIRECTION.W, DIRECTIONS.up, 'W');
  assertEqual(KEY_TO_DIRECTION.S, DIRECTIONS.down, 'S');
  assertEqual(KEY_TO_DIRECTION.A, DIRECTIONS.left, 'A');
  assertEqual(KEY_TO_DIRECTION.D, DIRECTIONS.right, 'D');
});

// ---------------------------------------------------------------- reporting

function reportResults() {
  const summary = document.getElementById('summary');
  const list = document.getElementById('results');
  const failures = testResults.filter((result) => !result.passed);

  testResults.forEach((result) => {
    const item = document.createElement('li');
    item.className = result.passed ? 'pass' : 'fail';
    item.textContent = result.passed
      ? `PASS  ${result.name}`
      : `FAIL  ${result.name} - ${result.message}`;
    list.appendChild(item);
  });

  const total = testResults.length;
  summary.className = failures.length === 0 ? 'pass' : 'fail';
  summary.textContent = failures.length === 0
    ? `All ${total} tests passed`
    : `${failures.length} of ${total} tests failed`;

  console.log(summary.textContent);
}

reportResults();
