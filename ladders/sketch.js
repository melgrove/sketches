// Mostly prompted

const mu = 20;
const sigma = 20;
let curveComplexity = 10;
let seed;
let animationSteps = 150;
let currentStep = 0;
let direction = 1; // 1 for forward, -1 for backward
let allAnimationPoints = [];
const quadrantSize = 1600;

function setup() {
  createCanvas(3200, 3200);
  seed = random(10000);
  console.log(seed);
  randomSeed(seed);
  background('white');
  frameRate(60);  // Set a higher frame rate
  generateAllAnimationPoints();
}

function draw() {
  background('white');
  
  // Draw the animations in all quadrants
  drawQuadrant(0, 0, 1, 1);           // Top-left
  drawQuadrant(quadrantSize, 0, -1, 1);    // Top-right
  drawQuadrant(0, quadrantSize, 1, -1);    // Bottom-left
  drawQuadrant(quadrantSize, quadrantSize, -1, -1); // Bottom-right
  
  currentStep += direction;
  if (currentStep >= animationSteps - 1 || currentStep <= 0) {
    direction *= -1;
  }
}

function drawQuadrant(offsetX, offsetY, scaleX, scaleY) {
  push();
  translate(offsetX + quadrantSize / 2, offsetY + quadrantSize / 2);
  scale(scaleX, scaleY);
  translate(-quadrantSize / 2, -quadrantSize / 2);
  
  let layerIndex = 0;
  for (let i = 1; i <= 10; i+=2) {
    drawLayer(0.1 + i, layerIndex);
    layerIndex++;
  }
  
  pop();
}

function drawLayer(weight, layerIndex) {
  let points = allAnimationPoints[layerIndex][currentStep];
  fill(0, 0, 0, 100)
  //noFill();
  stroke(0);
  noStroke();
  strokeWeight(weight);
  for (let i = 0; i < points.length - 3; i += 4) {
    beginShape();
    vertex(points[i].x, points[i].y);
    vertex(points[i+1].x, points[i+1].y);
    vertex(points[i+3].x, points[i+3].y);
    vertex(points[i+2].x, points[i+2].y);
    endShape(CLOSE);
  }
}

function generateAllAnimationPoints() {
  let layerIndex = 0;
  for (let i = 1; i <= 10; i+=2) {
    let curve1 = generateRandomCurve();
    let curve2 = generateRandomCurve();
    let initialPoints = generatePoints(curve1, curve2);
    let finalPoints = generateFinalPoints(initialPoints, layerIndex);
    
    let layerAnimationPoints = [];
    for (let step = 0; step < animationSteps; step++) {
      let t = step / (animationSteps - 1);
      let easedT = extremeEaseInOut(t);
      let stepPoints = interpolatePoints(initialPoints, finalPoints, easedT);
      layerAnimationPoints.push(stepPoints);
    }
    allAnimationPoints[layerIndex] = layerAnimationPoints;
    
    curveComplexity += 3;
    layerIndex++;
  }
}

function generateRandomCurve() {
  let curve = {
    start: createVector(random(quadrantSize), random(quadrantSize)),
    end: createVector(random(quadrantSize), random(quadrantSize)),
    controls: []
  };
  
  for (let i = 0; i < curveComplexity; i++) {
    curve.controls.push(createVector(random(quadrantSize), random(quadrantSize)));
  }
  
  return curve;
}

function generatePoints(curve1, curve2) {
  let points = [];
  let d = 0;
  while (d <= 1) {
    let point1 = getPointOnCurve(curve1, d);
    let point2 = getPointOnCurve(curve2, d);
    
    points.push(point1);
    points.push(point2);
    
    let pixelStep = randomGaussian(mu, sigma);
    d += pixelStep / curveLength(curve1);
  }
  return points;
}

function generateFinalPoints(initialPoints, i) {
  let finalPoints = [];
  for (let j = 0; j < initialPoints.length; j += 2) {
    let x1 = (i) * (quadrantSize / 5);
    let x2 = (i + 1) * (quadrantSize / 5);
    let y = map(j, 0, initialPoints.length - 2, quadrantSize, 0);
    finalPoints.push(createVector(x1, y));
    finalPoints.push(createVector(x2, y));
  }
  return finalPoints;
}

function interpolatePoints(initialPoints, finalPoints, t) {
  let interpolatedPoints = [];
  for (let i = 0; i < initialPoints.length; i++) {
    let x = lerp(initialPoints[i].x, finalPoints[i].x, t);
    let y = lerp(initialPoints[i].y, finalPoints[i].y, t);
    interpolatedPoints.push(createVector(x, y));
  }
  return interpolatedPoints;
}

function getPointOnCurve(curve, t) {
  let p = createVector(0, 0);
  let n = curve.controls.length + 1;
  
  p.add(curve.start.copy().mult(pow(1-t, n)));
  
  for (let i = 0; i < curve.controls.length; i++) {
    let coeff = n * pow(t, i+1) * pow(1-t, n-i-1);
    p.add(curve.controls[i].copy().mult(coeff));
  }
  
  p.add(curve.end.copy().mult(pow(t, n)));
  
  return p;
}

function curveLength(curve) {
  return p5.Vector.dist(curve.start, curve.end);
}

function randomGaussian(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * stdDev + mean;
  return num;
}

function extremeEaseInOut(t) {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) {
        return Math.pow(2, 20 * t - 10) / 2;
    } else {
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
    }
}
