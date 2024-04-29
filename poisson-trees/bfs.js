
// Params
const lengthMultiplier = 3;
const maxLength = 20;
const spread = 0.55;
const closeness = 5.2;
const minNodesToUse = 2;
const poissonLambda = 0.1;
let maxNodes = 40000;
const angleGranularity = 1;
// State
let state = [];
let globalAngleIdIncrement = 0;
let nNodesInPly = 19;

function setup() {
  createCanvas(1600, 1600);
  background("#FFFFFF");
  makeCircle(800, 800, 400, 1.5)

  // initial
  for(let n = 80; n <= 1520; n += 80) {
    state.push({
      x: n,
      y: 1560,
      branchId: -1,
      prevAngle: null,
    });
  }
}

function draw() {
  if (nNodesInPly === 0 || state.length > maxNodes) {
    noLoop();
    return;
  }
  const currentPly = state.slice(-nNodesInPly);
  nNodesInPly = 0;
  currentPly.forEach(branch);
  // console.log('//////////////////////// nNodesInPly: ' + nNodesInPly);
  // console.log('//////////////////////// state length: ' + state.length);
}

function branch(args) {
  let { x, y, branchId, prevAngle } = args;
  
  // eject command
  if (state.length > maxNodes) {
    return;
  }
  
  // calculate length and angle
  let length;
  let angle;
  const nearNodes = state
    .filter(e => e.branchId !== branchId) // Exclude current branch
    .map(e => ({
      dist: Math.sqrt(Math.pow(x - e.x, 2) + Math.pow(y - e.y, 2)), // euclidean distance
      coords: e
    }))
    .filter(e => e.dist < maxLength * lengthMultiplier + closeness);
  // console.log('nearNodes: ' + nearNodes);
  if (prevAngle === null || nearNodes.length < minNodesToUse) {
    // Default distance before any nodes
    length = maxLength * lengthMultiplier;
    
    // random branch angle, clamped from 0 to 180
    angle = 90 + ((Math.random() * 180 - 90) * spread);
    angle = Math.min(180, Math.max(0, angle));
  } else {
    const averageNearNodesDistance = nearNodes.reduce((acc, el) => acc + el.dist, 0) / nearNodes.length;
    // console.log('nearNodes dist: ' + averageNearNodesDistance);
    
    const maxAllowedDistance = Math.round(Math.min(
      maxLength,
      averageNearNodesDistance * lengthMultiplier
      //Math.max(0, Math.log2(averageNearNodesDistance)) * ((1 + lengthMultiplier) ** 6)
    ));
        
    // skip angle search if no length allowed
    if (maxAllowedDistance !== 0) {
      // Search
      const fromAngle = Math.max(0, Math.round(prevAngle - 90 * spread));
      const toAngle = Math.min(180, Math.round(prevAngle + 90 * spread));
      let bestNextStep = 0;
      let bestNextStepAngleLookup = [];
      for (let theta = toAngle; theta >= fromAngle; theta -= angleGranularity) {
        // console.log(theta)
        const rads = theta * Math.PI / 180;
        for(let d = 1; d <= maxAllowedDistance; d++) {
          // calculate coords
          const xToCheck = x + d * Math.cos(rads);
          const yToCheck = y - d * Math.sin(rads);
          // if too close stop
          const isTooClose = checkIfTooCloseToExistingNodes({
            x: xToCheck,
            y: yToCheck,
            existingNodes: nearNodes,
            closeness,
          });
          if (isTooClose) break;
          // else compare against longest
          // console.log('MADEIT')
          if (d === bestNextStep) {
            bestNextStepAngleLookup.push(theta);
          } else if (d > bestNextStep) {
            bestNextStep = d;
            bestNextStepAngleLookup = [theta];
          }
        }
      }
      length = bestNextStep;
      angle = bestNextStepAngleLookup[Math.floor(Math.random() * bestNextStepAngleLookup.length)]; // random element
      // console.log('ANGLE: ' + angle);
    } else {
      length = 0;
    }
  }

  // stop if zero length (exit condition)
  if (length === 0) return;

  
  // sample from Poisson to get number of new branches
  const nNewBranches = poissonSample(poissonLambda, length);
  
  // draw new branch
  const rads = angle * Math.PI / 180;
  // console.log(x + length * Math.cos(rads))
  // console.log(y - length * Math.sin(rads))
  // console.log('angle: ' + angle)
  // console.log('length: ' + length);
  // console.log('new branches: ' + nNewBranches);
  // console.log('====================');
  if(nNewBranches === 0) {
    noStroke();
    fill('red');
    circle(x + length * Math.cos(rads), y - length * Math.sin(rads), 8)
  } else {
    stroke('black')
    strokeWeight(3)
    line(x, y, x + length * Math.cos(rads), y - length * Math.sin(rads))
  }
  
  // make a new branch along the existing one
  for (let n = 0; n < nNewBranches; n++) {
    // get position
    const stepLength = length * ((n + 1) / nNewBranches);
    const branchX = x + stepLength * Math.cos(rads);
    const branchY = y - stepLength * Math.sin(rads);
    // get new id for the branch
    const branchId = globalAngleIdIncrement++;
    // add to next BFS iteration
    state.push({
      x: branchX,
      y: branchY,
      prevAngle: angle,
      branchId,
    });
    nNodesInPly++;
  }
}

function checkIfTooCloseToExistingNodes(args) {
  const { x, y, existingNodes, closeness } = args;
  for (let node of existingNodes) {
    const distance = Math.sqrt(Math.pow(x - node.coords.x, 2) + Math.pow(y - node.coords.y, 2));
    if (distance < closeness) {
      return true;
    }
  }
  return false;
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
function makeRect(x, y, sizeX, sizeY) {
  // Top side from (x, y) to (x + size, y)
  for (let px = x; px <= x + sizeX; px += closeness) {
    state.push({ x: px, y: y, branchId: -1, prevAngle: 0 }); // Horizontal, angle 0 (rightward)
  }
  
  // Right side from (x + size, y) to (x + size, y + size)
  for (let py = y; py <= y + sizeY; py += closeness) {
    state.push({ x: x + sizeX, y: py, branchId: -1, prevAngle: 90 }); // Vertical, angle 90 (downward)
  }

  // Bottom side from (x + size, y + size) to (x, y + size)
  for (let px = x + sizeX; px >= x; px -= closeness) {
    state.push({ x: px, y: y + sizeY, branchId: -1, prevAngle: 180 }); // Horizontal, angle 180 (leftward)
  }
  
  // Left side from (y + size, x) back to (x, y)
  for (let py = y + sizeY; py >= y; py -= closeness) {
    state.push({ x: x, y: py, branchId: -1, prevAngle: 270 }); // Vertical, angle 270 (upward)
  }
  
  // Draw it
  noStroke()
  fill('black');
  rect(x, y, sizeX, sizeY)
}

function makeCircle(x, y, radius, marginRatio) {
  const nPoints = Math.floor((2 * Math.PI * radius) / closeness); // Calculate number of points around the circle
  for (let i = 0; i < nPoints; i++) {
    const angle = (i / nPoints) * 2 * Math.PI; // Angle for each point in radians
    const px = x + radius * Math.cos(angle) * marginRatio / 2; // x coordinate
    const py = y + radius * Math.sin(angle) * marginRatio / 2; // y coordinate
    state.push({ x: px, y: py, branchId: -1, prevAngle: null });
  }
  
  noStroke();
  fill('black')
  circle(x, y, radius);
}
