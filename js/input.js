// Keyboard and touch input, translated into game intents.
//
// Returns a detach function so listeners can be removed cleanly.

const KEY_TO_DIRECTION = {
  ArrowUp: DIRECTIONS.up,
  ArrowDown: DIRECTIONS.down,
  ArrowLeft: DIRECTIONS.left,
  ArrowRight: DIRECTIONS.right,
  w: DIRECTIONS.up,
  s: DIRECTIONS.down,
  a: DIRECTIONS.left,
  d: DIRECTIONS.right,
  W: DIRECTIONS.up,
  S: DIRECTIONS.down,
  A: DIRECTIONS.left,
  D: DIRECTIONS.right
};

const SWIPE_THRESHOLD_PX = 24;

function attachInput(options) {
  const { keyTarget, swipeTarget, onDirection, onTogglePause, onRestart, onStart } = options;
  let touchOrigin = null;

  const handleKeyDown = (event) => {
    const direction = KEY_TO_DIRECTION[event.key];

    if (direction) {
      event.preventDefault();
      onDirection(direction);
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      onTogglePause();
      return;
    }

    if (event.key === 'r' || event.key === 'R') {
      onRestart();
      return;
    }

    if (event.key === 'Enter') {
      onStart();
    }
  };

  const handleTouchStart = (event) => {
    const touch = event.changedTouches[0];
    touchOrigin = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (touchOrigin === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchOrigin.x;
    const deltaY = touch.clientY - touchOrigin.y;
    touchOrigin = null;

    const isTap = Math.abs(deltaX) < SWIPE_THRESHOLD_PX &&
      Math.abs(deltaY) < SWIPE_THRESHOLD_PX;

    if (isTap) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onDirection(deltaX > 0 ? DIRECTIONS.right : DIRECTIONS.left);
      return;
    }

    onDirection(deltaY > 0 ? DIRECTIONS.down : DIRECTIONS.up);
  };

  keyTarget.addEventListener('keydown', handleKeyDown);
  swipeTarget.addEventListener('touchstart', handleTouchStart, { passive: true });
  swipeTarget.addEventListener('touchend', handleTouchEnd, { passive: true });

  return function detachInput() {
    keyTarget.removeEventListener('keydown', handleKeyDown);
    swipeTarget.removeEventListener('touchstart', handleTouchStart);
    swipeTarget.removeEventListener('touchend', handleTouchEnd);
  };
}
