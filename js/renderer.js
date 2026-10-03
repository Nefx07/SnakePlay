// Draws the board onto a canvas. Flat filled rectangles only: no images,
// no gradients, no effects.

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.cellCount = CONFIG.gridSize;
    this.cellSize = CONFIG.cellSize;
    this.colors = CONFIG.colors;

    this.canvas.width = this.cellCount * this.cellSize;
    this.canvas.height = this.cellCount * this.cellSize;
  }

  render(snake, food) {
    this.drawBackground();
    this.drawGrid();
    this.drawFood(food);
    this.drawSnake(snake);
  }

  drawBackground() {
    this.context.fillStyle = this.colors.background;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid() {
    const { context } = this;
    context.strokeStyle = this.colors.gridLine;
    context.lineWidth = 1;

    for (let index = 1; index < this.cellCount; index += 1) {
      const offset = index * this.cellSize + 0.5;

      context.beginPath();
      context.moveTo(offset, 0);
      context.lineTo(offset, this.canvas.height);
      context.stroke();

      context.beginPath();
      context.moveTo(0, offset);
      context.lineTo(this.canvas.width, offset);
      context.stroke();
    }
  }

  drawSnake(snake) {
    snake.segments.forEach((segment, index) => {
      const isHead = index === 0;
      this.context.fillStyle = isHead ? this.colors.snakeHead : this.colors.snakeBody;
      this.fillCell(segment.x, segment.y, isHead ? 1 : 2);
    });
  }

  drawFood(food) {
    if (food.position === null) {
      return;
    }
    this.context.fillStyle = this.colors.food;
    this.fillCell(food.position.x, food.position.y, 5);
  }

  fillCell(gridX, gridY, inset) {
    this.context.fillRect(
      gridX * this.cellSize + inset,
      gridY * this.cellSize + inset,
      this.cellSize - inset * 2,
      this.cellSize - inset * 2
    );
  }
}
