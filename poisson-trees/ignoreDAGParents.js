
// Params
const lengthMultiplier = 3;
const maxLength = 20;
let spread = 0.6;
let closeness = 1.1;
const minNodesToUse = 5;
const poissonLambda = 0.04;
let maxNodes = 100;
let angleGranularity = 5;
const angleGradientParams = null/*{
  perNNodes: 130,
  perNNodesIncrement: 20,
  perNNodesIncrementIncrement: 1,
  spreadChange: 0.015,
  angleGranularityChange: 3,
  closenessChange: 0.01,
}*/
// State
let state = [];
let globalAngleIdIncrement = 0;
let nNodesInPly = 15;
let colors = ['red', 'black']; //['#fafa6e', '#f0f269', '#e5ea64', '#d9e260', '#cdd95d', '#c1d059', '#b4c756', '#a7be54', '#9ab552', '#8cac51', '#7ea24f', '#70984e', '#628e4d', '#53734c', '#2a4858'];
colors = Array(15).fill().map(e => colors).reduce((acc, el) => [...acc, ...el], []);
let angleGradientIncrement = 0;
// Lookup which maps branchIds to the ids of every parent all the way up the tree.
// This is used so the branchId filter comparison remains O(1) because it is called many times.
const dagParentLookup = {
  0: new Set([]),
};

function setup() {
  createCanvas(1600, 1600);
  background("#FFFFFF");
  //makeCircle(800, 800, 400, 1)
  //makeCirlce(800, 800, 400, 1)

  // initial
  let rootId = 0;
  for(let n = 240; n <= 1360; n += 80) {
    state.push({
      x: n,
      y: 1560,
      branchId: 0,
      rootId: rootId++,
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
  let { x, y, branchId, prevAngle, rootId } = args;
  console.log('a')
  
  // update angle granularity
  angleGradientIncrement++;
  if (angleGradientParams && angleGradientParams.perNNodes === angleGradientIncrement) {
    console.log(angleGradientParams.perNNodes);
    angleGradientIncrement = 0;
    spread += angleGradientParams.spreadChange;
    closeness += angleGradientParams.closenessChange;
    angleGranularity = Math.min(90, angleGranularity + angleGradientParams.angleGranularityChange);
    angleGradientParams.perNNodes += angleGradientParams.perNNodesIncrement;
    angleGradientParams.perNNodesIncrement += angleGradientParams.perNNodesIncrementIncrement;
  }
  
  // eject command
  if (state.length > maxNodes) {
    return;
  }
  
  // calculate length and angle
  let length;
  let angle;
  const nearNodes = state
    .slice(-10000) // optimization
    .filter(e => !dagParentLookup[branchId].has(e.branchId)) // Exclude all parent branches
    .map(e => ({
      dist: Math.sqrt(Math.pow(x - e.x, 2) + Math.pow(y - e.y, 2)), // euclidean distance
      coords: e
    }))
    .filter(e => e.dist < maxLength * lengthMultiplier + closeness);
  // console.log('nearNodes: ' + nearNodes);
  if (prevAngle === null || nearNodes.length < minNodesToUse) {
    //console.log('bean')
    // Default distance before any nodes
    length = maxLength * lengthMultiplier;
    
    // random branch angle, clamped from 0 to 180
    angle = 90 + ((Math.random() * 180 - 90) * spread);
    angle = Math.min(180, Math.max(0, angle));
  } else {
    //console.log(nearNodes)
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
    fill('#848ff5');
    //circle(x + length * Math.cos(rads), y - length * Math.sin(rads), 8)
  } 
    stroke(colors[rootId])
    strokeWeight(3)
    line(x, y, x + length * Math.cos(rads), y - length * Math.sin(rads))
  
  // make a new branch along the existing one
  for (let n = 0; n < nNewBranches; n++) {
    // get position
    const stepLength = length * ((n + 1) / nNewBranches);
    const branchX = x + stepLength * Math.cos(rads);
    const branchY = y - stepLength * Math.sin(rads);
    // get new id for the branch
    const newBranchId = globalAngleIdIncrement++;
    // add to next BFS iteration
    state.push({
      x: branchX,
      y: branchY,
      prevAngle: angle,
      branchId: newBranchId,
      rootId,
    });
    // add to DAG lookup cache
    updateDagParentLookup(newBranchId, branchId)
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
  strokeWeight(3);
  for (let r = radius; r > 1; r -= 15) {
    circle(x, y, r);
  }
}

function updateDagParentLookup(child, parent) {
  dagParentLookup[child] = new Set(dagParentLookup[parent]);
  dagParentLookup[child].add(parent);
}
