var backgroundColor = 220;
var vertexRadius = 20;
var adjacencyList = [];
var menuHeight = 70;
var selectionList = [];

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
  placeVertexButton.position(20, menuHeight / 2 - 10);
  placeVertexButton.mousePressed(function() {
    mode = Mode.PLACE_VERTEX;
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.position(140, menuHeight / 2 - 10);
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
  })

  stroke(0);
}

function drawMenu() {
  fill(200);
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

function drawEdges(i, edges) {
  fill(0);
  x1 = adjacencyList[i][0]
  y1 = adjacencyList[i][1]
  last = -1;
  for (var j = 0; j < edges.length; j++) {
    x2 = adjacencyList[edges[j]][0];
    y2 = adjacencyList[edges[j]][1];
    // draws
    //if (last == -1 || last != edges[j])
    stroke(0);
    noFill();
    if (last != edges[j]) {
      line(x1, y1, x2, y2);
      last = edges[j];
    }
    else { // draws a curve .. still needs work
      mx = (x1 + x2) / 2;
      my = (y1 + y2) / 2;

      r = Math.sqrt(
        (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
      );

      theta = Math.atan(
        (x2 - x1) / (y2 - y1)
      );

      arc(mx, my, r, r, PI / 2 - theta, - PI / 2 - theta);
    }
    last = edges[j];
  }
}

function drawAdjacencyList() {
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i];
    x = v[0];
    y = v[1];
    e = adjacencyList[i][2];
    drawEdges(i, e);
  }
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i];
    x = v[0];
    y = v[1];
    drawVertex(x, y, i);
  }
}

function draw() {
  background(backgroundColor);
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
  hit = -1;
  for (var i = 0; i < adjacencyList.length; i++) {
    v = adjacencyList[i];
    x = v[0];
    y = v[1];
    if (mouseHitTest(x - vertexRadius / 2, y - vertexRadius / 2, x + vertexRadius / 2, y + vertexRadius / 2)) {
      hit = i;
      break;
    }
  }

  if (mode === Mode.PLACE_VERTEX) {
    if (mouseY > menuHeight + vertexRadius / 2)
      adjacencyList.push([mouseX, mouseY, []]);
  }

  else if (mode === Mode.PLACE_EDGE) {
    if (hit != -1) {
      selectionList.push(hit);
      if (selectionList.length == 2) {
        adjacencyList[selectionList[0]][2].push(selectionList[1]);
        selectionList.pop();
        selectionList.pop();
      }
      console.log(selectionList);
    }
  }

}
