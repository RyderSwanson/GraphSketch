var vertexRadius = 20;
var adjacencyList = [];
var menuHeight = 70;

const Mode = {
  PLACE_VERTEX: 0,
  PLACE_EDGE: 1,
};

var mode;
var placeVertexButton;
var placeEdgeButton;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // default mode
  mode = Mode.PLACE_VERTEX;

  // setup the place vertex button
  placeVertexButton = createButton('Place Vertex');
  placeVertexButton.position(20, menuHeight/2-10);
  placeVertexButton.mousePressed(function () {
    mode = Mode.PLACE_VERTEX;
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.position(140, menuHeight/2-10);
  placeEdgeButton.mousePressed(function () {
    mode = Mode.PLACE_EDGE;
  })
}

function drawMenu() {
  fill(200);
  rect(0, 0, windowWidth, menuHeight);
}

function drawVertex(x, y, id) {
  fill(200);
  circle(x, y, vertexRadius);
  fill(0);
  if (id < 10)
    text(id, x - 4, y + 5);
  else
    text(id, x - 7, y + 5);
}

function drawEdge(edges) {

}

function drawAdjacencyList() {
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i];
    x = v[0];
    y = v[1];
    drawVertex(x, y, i);
  }
}

function draw() {
  background(220);

  drawMenu();
  drawAdjacencyList()

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

// test each vertex for a hit
// can be made faster with dictionary if too slow
// if no hit place a new vertex
// if hit try to connect two vertices with edge
function mouseClicked() {
  hit = false;
  for (const v of adjacencyList) {
    x = v[0];
    y = v[1];
    if (mouseHitTest(x - vertexRadius / 2, y - vertexRadius / 2, x + vertexRadius / 2, y + vertexRadius / 2)) {
      hit = true;
      break;
    }
  }

  if (mode === Mode.PLACE_VERTEX) {
    if (mouseY > menuHeight + vertexRadius / 2)
      adjacencyList.push([mouseX, mouseY, []]);
  }
}
