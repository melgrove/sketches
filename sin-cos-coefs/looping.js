let masterCoef = 0;
let i = 0;
let j = 0;

function setup() {
  createCanvas(1000, 1000);
  background('white')
}

function draw() {
  
  stroke('purple');
  strokeWeight(2);
  
  console.log(masterCoef, i, j);
  if(j === 9 && i === 9) return;
  strokeWeight(((i + j) / 5) + 0.5);
  for(let n = -1; n <= 1; n += 2) {
    for(let m = -1; m <= 1; m += 2) {
      renderer(plotter(
        (i + 1) * masterCoef,
        (j + 1) * masterCoef,
        (i * 50 + 25) * n + ((Math.min(n, 0) * 1000) * -1),
        (j * 50 + 25) * m + ((Math.min(m, 0) * 1000) * -1)
      ));
    }
  }
  // fake looping
  if (i === 9) {
    i = 0;
    j++;
  } else {
    i++;
  }
  if (j === 9) {
    j = 0;
    masterCoef += 0.05;
  }
  if (masterCoef === 2) {
    masterCoef = 0;
  }

}


function plotter(sinmult, cosmult, xOffset, yOffset) {
  return (t) => {
    return [Math.sin(sinmult * Math.PI * t) * 25 + xOffset, Math.cos(cosmult * Math.PI * t) * 25 + yOffset];
  }
}

function renderer(fn) {
  let prev = fn(0);
  for(let n = 0.001; n <= 1; n += 0.001) {
    const result = fn(n);
    line(prev[0], prev[1], result[0], result[1]);
    prev = result;
  }
}

function filterer() {
  loadPixels();
  console.log(pixels[0])
}
