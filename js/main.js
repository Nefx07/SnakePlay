// Boot: connects the DOM, the renderer, the game and the input handlers.

(function boot() {
  const elements = {
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    canvas: document.getElementById('board'),
    frame: document.getElementById('board-frame'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayText: document.getElementById('overlay-text'),
    overlayButton: document.getElementById('overlay-button')
  };

  const OVERLAY_COPY = {
    [GAME_STATE.IDLE]: {
      title: 'Snake',
      text: 'Eat the food. Do not hit the walls or yourself.',
      button: 'Start'
    },
    [GAME_STATE.PAUSED]: {
      title: 'Paused',
      text: 'Press Space or the button to carry on.',
      button: 'Resume'
    },
    [GAME_STATE.OVER]: {
      title: 'Game Over',
      text: 'Press R or the button to try again.',
      button: 'Play again'
    },
    [GAME_STATE.WON]: {
      title: 'Board cleared',
      text: 'You filled every cell. Nothing left to eat.',
      button: 'Play again'
    }
  };

  const renderer = new Renderer(elements.canvas);

  const game = new Game({
    renderer,
    onScoreChange: (scores) => {
      elements.score.textContent = String(scores.score);
      elements.best.textContent = String(scores.best);
    },
    onStateChange: (state) => {
      const copy = OVERLAY_COPY[state];

      if (!copy) {
        elements.overlay.hidden = true;
        return;
      }

      elements.overlay.hidden = false;
      elements.overlayTitle.textContent = copy.title;
      elements.overlayText.textContent = copy.text;
      elements.overlayButton.textContent = copy.button;
    }
  });

  function handlePrimaryAction() {
    if (game.state === GAME_STATE.RUNNING) {
      return;
    }
    if (game.state === GAME_STATE.PAUSED) {
      game.togglePause();
      return;
    }
    game.start();
  }

  elements.overlayButton.addEventListener('click', handlePrimaryAction);

  attachInput({
    keyTarget: window,
    swipeTarget: elements.frame,
    onDirection: (direction) => {
      // Pressing a direction on the start screen begins the game straight away.
      if (game.state === GAME_STATE.IDLE) {
        game.start();
      }
      game.steer(direction);
    },
    onTogglePause: () => game.togglePause(),
    onRestart: () => {
      const wasRunning = game.state === GAME_STATE.RUNNING;
      game.restart();
      if (wasRunning) {
        game.start();
      }
    },
    onStart: () => game.start()
  });

  // Paints the first board and puts the start overlay on screen.
  game.restart();
})();
