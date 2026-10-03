// Game rules, state machine and timing.
//
// Owns the snake, the food and the tick timer. It reports changes through
// callbacks and never touches the DOM itself, so the rule logic stays
// testable on its own.

class Game {
  constructor(options) {
    this.renderer = options.renderer;
    this.scoreStore = new ScoreStore(CONFIG.storageKey);
    this.onScoreChange = options.onScoreChange;
    this.onStateChange = options.onStateChange;

    this.snake = new Snake();
    this.food = new Food();
    this.bestScore = this.scoreStore.load();
    this.score = 0;
    this.tickMs = CONFIG.startTickMs;
    this.timerId = null;
    this.state = GAME_STATE.IDLE;
  }

  start() {
    if (this.state === GAME_STATE.RUNNING) {
      return;
    }
    if (this.state === GAME_STATE.OVER || this.state === GAME_STATE.WON) {
      this.restart();
    }
    this.setState(GAME_STATE.RUNNING);
    this.scheduleTick();
  }

  restart() {
    this.stopTimer();
    this.snake.reset();
    this.food.respawn(this.snake);
    this.score = 0;
    this.tickMs = CONFIG.startTickMs;
    this.setState(GAME_STATE.IDLE);
    this.renderer.render(this.snake, this.food);
    this.emitScore();
  }

  togglePause() {
    if (this.state === GAME_STATE.RUNNING) {
      this.stopTimer();
      this.setState(GAME_STATE.PAUSED);
      return;
    }

    if (this.state === GAME_STATE.PAUSED) {
      this.setState(GAME_STATE.RUNNING);
      this.scheduleTick();
    }
  }

  steer(direction) {
    if (this.state !== GAME_STATE.RUNNING) {
      return;
    }
    this.snake.steer(direction);
  }

  scheduleTick() {
    this.timerId = window.setTimeout(() => this.tick(), this.tickMs);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  // One frame: move, resolve what the head landed on, then draw and queue the
  // next frame. Anything that ends the run flips the state, which the guard
  // below notices so the loop cannot keep ticking after a loss.
  tick() {
    this.timerId = null;
    this.advanceSnake();

    if (this.state !== GAME_STATE.RUNNING) {
      return;
    }

    this.renderer.render(this.snake, this.food);
    this.scheduleTick();
  }

  // The landing cell is tested before the move is committed, so a fatal step
  // never happens and the snake is always drawn fully inside the board.
  advanceSnake() {
    const nextHead = this.snake.getNextHead();

    if (this.snake.isOutside(nextHead) || this.snake.wouldBite(nextHead)) {
      this.finish(GAME_STATE.OVER);
      return;
    }

    this.snake.step();

    if (this.food.isAt(this.snake.head.x, this.snake.head.y)) {
      this.eat();
    }
  }

  eat() {
    this.snake.grow();
    this.score += CONFIG.pointsPerFood;
    this.tickMs = Math.max(CONFIG.fastestTickMs, this.tickMs - CONFIG.tickStepMs);
    this.emitScore();

    const nextFood = this.food.respawn(this.snake);
    if (nextFood === null) {
      this.finish(GAME_STATE.WON);
    }
  }

  finish(state) {
    this.stopTimer();

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.scoreStore.save(this.bestScore);
    }

    this.setState(state);
    this.renderer.render(this.snake, this.food);
  }

  setState(state) {
    this.state = state;
    this.onStateChange(state);
  }

  emitScore() {
    this.onScoreChange({ score: this.score, best: this.bestScore });
  }
}
