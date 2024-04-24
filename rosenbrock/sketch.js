let y = 0;
let panelIter = 0;
const GRANULARITY = [6, 14, 40, 200]
const CANVAS_SIZE = 800;
const transformX = [0, CANVAS_SIZE, CANVAS_SIZE * 2, CANVAS_SIZE * 3];
const transformY = [0, 0, 0, 0];


function setup() {
  createCanvas(CANVAS_SIZE * 4, CANVAS_SIZE);
  background(220);
  noStroke();
}

function draw() {
  const gran = GRANULARITY[panelIter]
  const binSize = (CANVAS_SIZE / gran)
  if (y === gran) {
    if (panelIter === 3) {
      noLoop();
      return;
    }
    panelIter++;
    y = 0;
    return;
  }
  for (let x = 0; x < gran; x++) {
    const result = rosenbrock((x + 0.5) / (gran / 4) - 2, 3 - (y + 0.5) / (gran / 4));
    const normalized = log((result + 1) / 1) * 40;
    const c = color(230, Math.max(0, normalized - 100), (255 - Math.min(255, normalized + 180)) * (255 / 75));
    fill(c);
    square(x * binSize + transformX[panelIter], y * binSize + transformY[panelIter], binSize);
  }
  y++;
}

function rosenbrock(x, y) {
  return (1 - x)**2 + 100 * (y - x**2)**2;
}
