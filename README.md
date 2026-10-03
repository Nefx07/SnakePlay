# Snake

A minimal Snake game. Plain HTML, CSS and JavaScript. No frameworks, no build
step, no dependencies. Open the file and play.

Built for Stardance (Hack Club) - Mission Frictionless.

## Play it

Double-click `index.html`, or drag it into any browser. That is the whole
setup.

## Controls

| Action | Keys |
| --- | --- |
| Move | Arrow keys or `W` `A` `S` `D` |
| Start | Any direction key, `Enter`, or the button |
| Pause / resume | `Space` |
| Restart | `R` |

On a phone, swipe on the board instead of using the keys.

## Rules

Eat the red pellet to score 10 points and grow one segment. The game speeds up
each time you eat. Hitting a wall or your own body ends the run. Your best
score is saved in the browser.

## Run the tests

Open `tests.html` in a browser. It runs 20 checks on the game rules and prints
`All 20 tests passed` at the top if everything is working.

## Files

```
index.html      the page: canvas, score board, overlay
tests.html      the test runner page
style.css       all styling
js/config.js    board size, speed, scoring and colours
js/storage.js   best-score saving, with a fallback when storage is blocked
js/snake.js     the snake: movement, turning, growth, collision
js/food.js      food placement
js/input.js     keyboard and swipe handling
js/renderer.js  drawing the board on the canvas
js/game.js      rules, state machine and timing
js/main.js      wiring the pieces together
js/tests.js     the 20 tests
```

## Notes on the design

- `js/game.js` never touches the DOM. It reports changes through callbacks, so
  the rules can be tested without a browser or a timer.
- Food is placed by picking from the cells the snake is not using. It can never
  land on the snake, and a full board is reported instead of looping forever.
- The landing cell is checked before the snake moves, so a fatal step never
  happens and the snake is always drawn inside the board.
- Turning is refused if it would reverse the snake, including when two keys are
  pressed within the same tick.
- Everything is drawn as flat rectangles. No images, gradients or effects.

## Submitting

Because it is a static site, it can go straight onto GitHub Pages:

1. Push this folder to a GitHub repository.
2. In the repository, open Settings then Pages.
3. Set the source to the main branch and the root folder, then save.
4. Open the published URL and send that to Stardance.

There is nothing to compile, so the deployed version is the same as the files
in this folder.
