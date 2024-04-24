// Params
let a = 200;
let b = 50;
let c = -20;
let d = 10;
let flipper = 1;
let iter = 0;
let lookupIter = 0;
let panelIter = 0;
let panelTranslation = [
  [600, 600],
  [600, 0],
  [0, 0],
  [0, 600]
];
let panelSubtraction = [
  [false, false],
  [false, true],
  [true, true],
  [true, false]
];

const lookup = ['white', '#4cb4c7', '#2b165c', '#3e55b8', '#5596cf'];

function setup() {
  createCanvas(1200, 1200);
  background('black');
  frameRate(30);
}

function draw() {
  if (iter === 10) {
    if (lookupIter === 4) {
      if (panelIter === 3) {
        noLoop();
        return;
      }
      // next frame
      iter = 0;
      lookupIter = 0;
      a = 200;
      b = 50;
      c = -20;
      d = 0;
      panelIter++;
    } else {
      // next color
      iter = 0;
      lookupIter++;
    }
  }
  for (let n = 0; n < (100 - lookupIter * 22); n++) {
    if (a > 0 && a < 600 && b < 600 && b > 0) {
      let x = a + panelTranslation[panelIter][0];
      if (panelSubtraction[panelIter][0]) x = 600 - x;
      let y = b + panelTranslation[panelIter][1];
      if (panelSubtraction[panelIter][1]) y = 600 - y;
      if (lookupIter === 1) {
        fill("black");
        square(x, y, isNaN(15 % a - b) ? 5 : 10 % a - b / 3)
      } else {
        square(x, y, isNaN(15 % a - b) ? 5 : 10 % a - b / 5)
      }
    }
    strokeWeight(isNaN(15 % a - b) ? 5 : 10 % a - b / 5);
    stroke(lookup[lookupIter]);
    a = b;
    b = c + d * 0.1;
    c = a + Math.random() * 10 * (lookupIter + 1);
    d = d + 1 * flipper;
    flipper = -flipper;
  }
  a = 600 - a;
  b = 600 - b;
  c = Math.random();
  d = 0;
  iter++;
}
