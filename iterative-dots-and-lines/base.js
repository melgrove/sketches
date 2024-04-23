let c;
let loc = [500, 200, 10, 0];
let n = 1;
let i = 0;
let denominator = 400;

function setup() {
  createCanvas(800, 1500);
  background('red');
  frameRate(10);
  stroke('white')
  c = color('black');
}

function draw() {
  circ(Array.from(loc), n, denominator, []);
  denominator -= 10;
  if (denominator < 200) noLoop();
}

function circ(loc, n, denominator, history) {
  if (n + 50 < loc[2]) {
    console.log(history)
    for(let m = 0; m < history.length; m++) {
      fill(c);
      if (m !== history.length - 1) {
        stroke('white')
        strokeWeight(m + 1)
        line(
          200 + history[m][1],
          history[m][0],
          200 + history[m+1][1],
          history[m+1][0]
        )
        line(
          600 - history[m][1],
          history[m][0],
          600 - history[m+1][1],
          history[m+1][0]
        )
      }
      // c.setAlpha(255 - history[m][2] * 2);
      const [x, xx, xxx] = history[m];
      strokeWeight(0)
      if (m !== 0) {
        circle(190 + xx, x, xxx);
        circle(610 - xx, x, xxx);
      }
    }
    return;
  } 
  
  // Calculate new position and size
  loc[0] = (loc[1] * loc[0]) / denominator;
  loc[1] = loc[1] + 2 * 8 + 2 * loc[3];
  loc[2] = loc[2] + loc[3] / 2;
  loc[3] = loc[3] + Math.round(2);
  
  circ(loc, n + 0.5, denominator, [...history, Array.from(loc)]);  // Recursive call
}
