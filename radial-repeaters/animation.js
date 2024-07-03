let plots = [];
let oldPlots = [];
let plotSize = 400;
let padding = 20;
let groupCountRange = { min: 2, max: 20, steps: 4 };
let numPointsRange = { min: 3, max: 30, steps: 4 };
const groupCountExponent = 3;
const numPointsExponent = 1;
let REGENERATE_INTERVAL;
const META_LOOP_DURATION = 20000; // 20 seconds in milliseconds
const MAX_REGENERATE_INTERVAL = 2000;
const MIN_REGENERATE_INTERVAL = 100;
let metaLoopStartTime;
let lastRegenerateTime = 0;
let transitionProgress = 0;
const easeStrength = 0.6

function setup() {
  createCanvas(2500, 2500);
  angleMode(RADIANS);
  generatePlots();
  oldPlots = JSON.parse(JSON.stringify(plots)); // Deep copy
  metaLoopStartTime = millis();
}

function draw() {
  let currentTime = millis();
  let metaLoopProgress = (currentTime - metaLoopStartTime) % META_LOOP_DURATION / META_LOOP_DURATION;
  
  // Calculate REGENERATE_INTERVAL
  if (metaLoopProgress < 0.5) {
    // First 10 seconds: interval decreases
    REGENERATE_INTERVAL = map(metaLoopProgress, 0, 0.5, MAX_REGENERATE_INTERVAL, MIN_REGENERATE_INTERVAL);
  } else {
    // Second 10 seconds: interval increases
    REGENERATE_INTERVAL = map(metaLoopProgress, 0.5, 1, MIN_REGENERATE_INTERVAL, MAX_REGENERATE_INTERVAL);
  }

  background("white");
  
  if (currentTime - lastRegenerateTime > REGENERATE_INTERVAL) {
    oldPlots = JSON.parse(JSON.stringify(plots)); // Deep copy current plots
    generatePlots(); // Generate new plots
    lastRegenerateTime = currentTime;
    transitionProgress = 0;
  } else {
    transitionProgress = (currentTime - lastRegenerateTime) / REGENERATE_INTERVAL;
  }
  
  for (let i = 0; i <= groupCountRange.steps; i++) {
    for (let j = 0; j <= numPointsRange.steps; j++) {
      let index = i * (numPointsRange.steps + 1) + j;
      let x = i * (plotSize + padding) + padding + 170;
      let y = height - (j + 1) * (plotSize + padding) - 170;
      drawPlot(oldPlots[index], plots[index], x, y);
    }
  }
}

function generatePlots() {
  plots = [];
  for (let i = 0; i <= groupCountRange.steps; i++) {
    for (let j = 0; j <= numPointsRange.steps; j++) {
      let groupCount = floor(exponentialMap(i, 0, groupCountRange.steps, groupCountRange.min, groupCountRange.max, groupCountExponent));
      let numPoints = floor(exponentialMap(j, 0, numPointsRange.steps, numPointsRange.min, numPointsRange.max, numPointsExponent));
      plots.push(createPlot(groupCount, numPoints));
    }
  }
}

function createPlot(groupCount, numPoints) {
  let points = [];
  let radius = plotSize / 2 - 10;
  let translationScale = 0.5;
  
  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    points.push(createVector(x, y));
  }
  
  applyRadialTranslation(points, groupCount, translationScale, radius);
  
  return { points: points, groupCount: groupCount, numPoints: numPoints, color: randomBlue() };
}

function drawPlot(oldPlot, newPlot, x, y) {
  push();
  translate(x + plotSize/2, y + plotSize/2);
  
  let easedProgress = easeInOutCubic(transitionProgress, 1);
  let interpolatedColor = lerpColor(oldPlot.color, newPlot.color, easedProgress);
  fill(interpolatedColor);
  stroke(0);
  strokeWeight(0);
  beginShape();
  for (let i = 0; i < newPlot.points.length; i++) {
    let oldP = oldPlot.points[i] || newPlot.points[i];
    let newP = newPlot.points[i];
    let x = lerp(oldP.x, newP.x, easedProgress);
    let y = lerp(oldP.y, newP.y, easedProgress);
    curveVertex(x, y);
  }
  // Ensure the shape is closed
  let firstPoint = newPlot.points[0];
  curveVertex(lerp(oldPlot.points[0].x, firstPoint.x, easedProgress), 
              lerp(oldPlot.points[0].y, firstPoint.y, easedProgress));
  endShape(CLOSE);
  
  pop();
}

function applyRadialTranslation(points, groupCount, scale, radius) {
  for (let i = 0; i < groupCount; i++) {
    let translationAmount = random(-radius * scale, radius * scale);
    for (let j = i; j < points.length; j += groupCount) {
      let p = points[j];
      let angle = atan2(p.y, p.x);
      let newRadius = p5.Vector.mag(p) + translationAmount;
      p.x = cos(angle) * newRadius;
      p.y = sin(angle) * newRadius;
    }
  }
}

function exponentialMap(value, start1, stop1, start2, stop2, exponent) {
  let t = (value - start1) / (stop1 - start1);
  t = pow(t, exponent);
  return start2 + t * (stop2 - start2);
}

function randomBlue() {
  let r = random(0, 100);
  let g = random(0, 150);
  let b = random(150, 255);
  let a = random(10, 100);
  return color(r, g, b, a);
}

function easeInOutCubic(t) {
  if (t < 0.5) {
    return 0.5 * pow(2 * t, 3 * easeStrength);
  } else {
    return 1 - 0.5 * pow(2 * (1 - t), 3 * easeStrength);
  }
}
