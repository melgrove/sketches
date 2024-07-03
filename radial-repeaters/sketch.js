let plots = [];
let plotSize = 90; // Adjusted for more plots
let padding = 15; // Adjusted for more plots
let groupCountRange = { min: 2, max: 30, steps: 21 };
let numPointsRange = { min: 3, max: 60, steps: 24 };
const groupCountExponent = 2.3
const numPointsExponent = 2.4

function setup() {
  createCanvas(2500, 2800); // Increased canvas size
  angleMode(RADIANS);
  
  for (let i = 0; i <= groupCountRange.steps; i++) {
    for (let j = 0; j <= numPointsRange.steps; j++) {
      let groupCount = floor(exponentialMap(i, 0, groupCountRange.steps, groupCountRange.min, groupCountRange.max, groupCountExponent));
      let numPoints = floor(exponentialMap(j, 0, numPointsRange.steps, numPointsRange.min, numPointsRange.max, numPointsExponent));
      plots.push(createPlot(groupCount, numPoints));
    }
  }
}

function draw() {
  background(220);
  
  for (let i = 0; i <= groupCountRange.steps; i++) {
    for (let j = 0; j <= numPointsRange.steps; j++) {
      let index = i * (numPointsRange.steps + 1) + j;
      let x = i * (plotSize + padding) + padding + 80;
      let y = height - (j + 1) * (plotSize + padding) - 80;
      drawPlot(plots[index], x, y);
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
  
  return { points: points, groupCount: groupCount, numPoints: numPoints };
}

function drawPlot(plot, x, y) {
  push();
  translate(x + plotSize/2, y + plotSize/2);
  
  // Draw curve
  fill(0)
  //noFill();
  stroke(0);
  strokeWeight(1.5);
  beginShape();
  curveVertex(plot.points[plot.points.length-1].x, plot.points[plot.points.length-1].y);
  for (let p of plot.points) {
    curveVertex(p.x, p.y);
  }
  curveVertex(plot.points[0].x, plot.points[0].y);
  curveVertex(plot.points[1].x, plot.points[1].y);
  endShape();
  
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
  // Re-map value to 0-1
  let t = (value - start1) / (stop1 - start1);
  
  // Apply exponential function
  t = pow(t, exponent);
  
  // Re-map to desired range
  return start2 + t * (stop2 - start2);
}
