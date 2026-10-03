// The food pellet.
//
// It is placed by picking uniformly from the cells the snake is not using.
// That makes it impossible for food to appear inside the snake, and it can
// never spin forever hunting for a gap that no longer exists on a full board.

class Food {
  constructor() {
    this.position = null;
  }

  respawn(snake) {
    const freeCells = [];

    for (let y = 0; y < CONFIG.gridSize; y += 1) {
      for (let x = 0; x < CONFIG.gridSize; x += 1) {
        if (!snake.occupies(x, y)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length === 0) {
      this.position = null;
      return null;
    }

    const pick = Math.floor(Math.random() * freeCells.length);
    this.position = freeCells[pick];
    return this.position;
  }

  isAt(x, y) {
    return this.position !== null &&
      this.position.x === x &&
      this.position.y === y;
  }
}
