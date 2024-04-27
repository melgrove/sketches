let state = [];
// Params
const len = 0.8;
const initialLen = 10;
const spread = 0.3;
const closeness = 0.2;
const poissonLambda = 0.08;
let maxNodes = 200;
let nNodes = 0;

function setup() {
  createCanvas(800, 800);
  background("#244526");
  noLoop();
}

function draw() {
  for(let n = 80; n <= 720; n += 80) {
    nNodes = 0;
    branch({
      angle: 90,
      x: n,
      y: 780,
      ignorePrevNodes: 0,
    });
  }
}

function branch(args) {
  let { angle, x, y, ignorePrevNodes } = args;
  
  // eject command
  nNodes++;
  if (nNodes > maxNodes) {
    return;
  }

  // branch angle, clamped from 0 to 180
  angle = angle + ((Math.random() * 180 - 90) * spread);
  angle = Math.min(180, Math.max(0, angle));
  const rads = angle * Math.PI / 180;
  
  // calculate length based on nearness and len
  let averageDistanceOfNearNodes
  if (state.length < 5) {
    // Default distance before any nodes
    averageDistanceOfNearNodes = initialLen;
  } else {
    averageDistanceOfNearNodes = ( ignorePrevNodes === 0 ?
        state :
        state.slice(0, -ignorePrevNodes) // don't consider nodes from same parent
      )
      .map(e => Math.sqrt(Math.pow(x - e[0], 2) + Math.pow(y - e[1], 2))) // euclidean distance
      .sort((a, b) => a - b)
      .slice(0, 5)
      .reduce((acc, el) => acc + el, 0) / 5;
  }
  const length = Math.max(0, Math.log2(averageDistanceOfNearNodes * closeness)) * ((1 + len) ** 6);
  
  // Add branch start to state
  state.push([x, y])
  
  // stop if zero length (exit condition)
  if (length === 0) return;
  
  // draw the branch
  line(x, y, x + length * Math.cos(rads), y - length * Math.sin(rads))
  
  // sample from Poisson to get number of occurances
  const nNewBranches = poissonSample(poissonLambda, length);
  
  console.log(nNewBranches)
  
  // make a new branch along the existing one
  for (let n = 0; n < nNewBranches; n++) {
    // get position
    const stepLength = length * ((n + 1) / nNewBranches);
    const newX = x + stepLength * Math.cos(rads);
    const newY = y - stepLength * Math.sin(rads);
    // recurse
    branch({ angle, x: newX, y: newY, ignorePrevNodes: n });
  }
}

// Sample from Poission dist using inverse transform CDF method
function poissonSample(lambda, t) {
    const lambdaT = lambda * t;
    let sum = 0;
    let factorial = 1;  // 0! = 1
    let powLambdaT = 1; // (lambda * t)^0 = 1
    let F = Math.exp(-lambdaT);  // P(X = 0)
    sum = F;
    const U = Math.random();

    let i = 0;
    while (sum < U) {
        i++;
        powLambdaT *= lambdaT / i;  // (lambdaT)^i / i!
        F = powLambdaT * Math.exp(-lambdaT);
        sum += F;
    }
    return i;
}
