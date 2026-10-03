// The snake itself: an ordered list of grid cells, head first.

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

class Snake {
  constructor() {
    this.segments = [];
    this.reset();
  }

  reset() {
    const middle = Math.floor(CONFIG.gridSize / 2);
    this.direction = DIRECTIONS.right;
    this.queuedDirection = DIRECTIONS.right;
    this.shouldGrow = false;
    this.segments = [];

    for (let index = 0; index < CONFIG.startLength; index += 1) {
      this.segments.push({ x: middle - index, y: middle });
    }
  }

  get head() {
    return this.segments[0];
  }

  get length() {
    return this.segments.length;
  }

  // A turn is refused when it would reverse the snake onto its own neck.
  // Both the direction currently being travelled and the one already queued
  // for this tick are checked, otherwise two fast key presses could still
  // produce a 180 degree turn.
  steer(direction) {
    const reverses = (reference) =>
      direction.x === -reference.x && direction.y === -reference.y;
    const repeats = (reference) =>
      direction.x === reference.x && direction.y === reference.y;

    if (reverses(this.direction) || reverses(this.queuedDirection)) {
      return false;
    }
    if (repeats(this.direction) || repeats(this.queuedDirection)) {
      return false;
    }

    this.queuedDirection = direction;
    return true;
  }

  // Moves one cell forward. The tail is dropped only when the snake is not
  // growing, which is exactly what makes eating add a segment.
  step() {
    this.direction = this.queuedDirection;
    this.segments.unshift({
      x: this.head.x + this.direction.x,
      y: this.head.y + this.direction.y
    });

    if (this.shouldGrow) {
      this.shouldGrow = false;
    } else {
      this.segments.pop();
    }
  }

  grow() {
    this.shouldGrow = true;
  }

  occupies(x, y) {
    return this.segments.some((segment) => segment.x === x && segment.y === y);
  }

  // Where the head would land next, without committing to the move.
  // Callers test this cell first so a fatal step never actually happens.
  getNextHead() {
    return {
      x: this.head.x + this.queuedDirection.x,
      y: this.head.y + this.queuedDirection.y
    };
  }

  isOutside(cell) {
    return cell.x < 0 ||
      cell.y < 0 ||
      cell.x >= CONFIG.gridSize ||
      cell.y >= CONFIG.gridSize;
  }

  // True when entering the cell would run into the body. The tail cell does
  // not count, because it is vacated on this same step, unless the snake is
  // due to grow and therefore keeps it.
  wouldBite(cell) {
    const body = this.shouldGrow ? this.segments : this.segments.slice(0, -1);
    return body.some((segment) => segment.x === cell.x && segment.y === cell.y);
  }
}
