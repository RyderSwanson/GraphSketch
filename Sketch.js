var backgroundColor = 220;
var vertexRadius = 50;
var adjacencyList = [];
var menuHeight = 70;
var selectionList = [];

const Mode = {
  PLACE_VERTEX: 0,
  PLACE_EDGE: 1,
  SELECT: 2,
};

var mode;
var placeVertexButton;
var placeEdgeButton;

class Vertex {
  constructor(x, y, i) {
    this.x = x;
    this.y = y;
    this.i = i; // id
    this.fillColor = 200;
    this.strokeColor = "black";
    this.textColor = "black"
    this.radius = vertexRadius;
  }

  draw() {
    stroke(this.strokeColor);
    fill(this.fillColor);
    circle(this.x, this.y, this.radius);
    fill(this.textColor);
    if (this.i < 10)
      text(this.i, this.x - 4, this.y + 5);
    else
      text(this.i, this.x - 8, this.y + 5);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // default mode
  mode = Mode.PLACE_VERTEX;

  // setup the place vertex button
  placeVertexButton = createButton('Place Vertex');
  placeVertexButton.position(20, menuHeight / 2 - 10);
  placeVertexButton.mousePressed(function() {
    mode = Mode.PLACE_VERTEX;
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.position(140, menuHeight / 2 - 10);
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
  })

  selectButton = createButton('Select');
  selectButton.position(250, menuHeight / 2 - 10);
  selectButton.mousePressed(function() {
    mode = Mode.SELECT;
  })


  stroke(0);
}

function drawMenu() {
  fill(200);
  stroke(200);
  rect(0, 0, windowWidth, menuHeight);
}

function drawVertex(x, y, i) {
  stroke("black");
  fill(200);
  circle(x, y, vertexRadius);
  fill(0);
  if (i < 10)
    text(i, x - 4, y + 5);
  else
    text(i, x - 7, y + 5);
}

function drawEdges() {
  fill(0);
  stroke(0);
  for (var i = 0; i < adjacencyList.length; i++) {
    v1 = adjacencyList[i][0];
    e = adjacencyList[i][1];
    x1 = v1.x;
    y1 = v1.y
    for (var j = 0; j < e.length; j++) {
      if (e[j] >= i) { // draws edge once in undirected graph
        v2 = adjacencyList[e[j]][0];
        x2 = v2.x;
        y2 = v2.y;

        // find slope of the line
        m = (y2 - y1) / (x2 - x1);

        // creating control points that lie on the line between the two vertices
        scale = .2;
        curve_x1 = ((x1 - x2) * scale) + x1;
        curve_y1 = ((y1 - y2) * scale) + y1;
        curve_x2 = ((x2 - x1) * scale) + x2;
        curve_y2 = ((y2 - y1) * scale) + y2;
        
        // Number of edges between the two vertices
        num_edges = e.filter(x => x==v2.i).length;
        // print(num_edges);

        if (num_edges > 1) {
          d = dist(x1, y1, x2, y2);
          // move points perpendicular to the line
          bend_amount = ((1 / (num_edges+1)) * (j+1)) - 0.5; // making bad assumption here that j cant be bigger than num_edges
          bend_amount *= d / 2;
          bend_amount *= num_edges/3;
          curve_x1 += bend_amount * ((y2 - y1) / d);
          curve_y1 += bend_amount * ((x1 - x2) / d);
          curve_x2 += bend_amount * ((y2 - y1) / d);
          curve_y2 += bend_amount * ((x1 - x2) / d);
        }

        // draw control points
        // fill(0);
        // circle(curve_x1, curve_y1, 5);
        // circle(curve_x2, curve_y2, 5);


        // Draw the edge
        stroke(0);
        noFill();
        curve(curve_x1, curve_y1, x1, y1, x2, y2, curve_x2, curve_y2);
      }
    }
  }
}

function drawAdjacencyList() {
  drawEdges();
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i][0];
    v.draw();
  }
}

function draw() {
  background(backgroundColor);
  drawMenu();

  if (mouseIsPressed === true && selectionList.length > 0 && mode === Mode.SELECT) {
    adjacencyList[selectionList[0]][0].x = mouseX; 
    adjacencyList[selectionList[0]][0].y = mouseY; 
  }

  if (mouseIsPressed === false && mode === Mode.SELECT) {
    while (selectionList.length > 0)
      selectionList.pop();
  }

  drawAdjacencyList();

}

function mouseHitTest(x1, y1, x2, y2) {
  var xhit = false;
  var yhit = false;
  if (mouseX >= x1 && mouseX <= x2) {
    xhit = true;
  }

  if (mouseY >= y1 && mouseY <= y2) {
    yhit = true;
  }

  return xhit && yhit;
}

function vertexHit() {
  hit = -1;
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i][0];
    if (mouseHitTest(v.x - v.radius / 2, v.y - v.radius / 2, v.x + v.radius / 2, v.y + v.radius / 2)) {
      hit = i;
      break;
    }
  }
  return hit;
}

// test each vertex for a hit
// can be made faster with dictionary if too slow
// if no hit place a new vertex
// if hit try to connect two vertices with edge
function mousePressed() {

  hit = vertexHit();

  if (mode === Mode.PLACE_VERTEX) {
    if (mouseY > menuHeight + vertexRadius / 2)
      adjacencyList.push([new Vertex(mouseX, mouseY, adjacencyList.length), []]);
  }

  else if (mode === Mode.PLACE_EDGE) {
    if (hit != -1) {
      selectionList.push(hit);
      adjacencyList[hit][0].strokeColor = "blue";
      if (selectionList.length === 2) {
        console.log(selectionList);
        adjacencyList[selectionList[0]][1].push(selectionList[1]);
        adjacencyList[selectionList[1]][1].push(selectionList[0]);
        adjacencyList[selectionList[0]][0].strokeColor = "black";
        adjacencyList[selectionList[1]][0].strokeColor = "black";
        while (selectionList.length > 0)
          selectionList.pop();
      }
      console.log(adjacencyList);
    }
  }

  else if (mode === Mode.SELECT && hit !== -1) {
    selectionList.push(hit);
  }

}
