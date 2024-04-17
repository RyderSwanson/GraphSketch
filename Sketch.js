var backgroundColor = '#d1d1d1';
var menuColor = '#dbdbdb';
var vertexColor = '#85C7F2';
var edgeColor = '#000000';
var textColor = '#000000';
var buttonColor = '#636363';
var selectedColor = '#E4FF1A';
var vertexRadius = 50;
var adjacencyList = [];
var menuHeight = 70;
var selectionList = [];
var offsetX = 0;
var offsetY = 0;

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
    this.radius = vertexRadius;
    this.selected = false;
  }

  draw() {
    strokeWeight(4);
    stroke(menuColor);
    if (this.selected) {
      stroke(selectedColor);
    }
    fill(vertexColor);
    circle(this.x, this.y, this.radius);
    stroke(textColor);
    strokeWeight(1);
    fill(textColor);
    textFont('Arial');
    textSize(20);
    textAlign(CENTER, CENTER);
    text(this.i, this.x, this.y);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // default mode
  mode = Mode.PLACE_VERTEX;

  // setup the place vertex button
  placeVertexButton = createButton('Place Vertex');
  placeVertexButton.style('background-color', buttonColor);
  placeVertexButton.style('color', 'white');
  placeVertexButton.style('font-size', '20px');
  placeVertexButton.position(20, menuHeight / 2 - 10);
  placeVertexButton.mousePressed(function() {
    mode = Mode.PLACE_VERTEX;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.style('background-color', buttonColor);
  placeEdgeButton.style('color', 'white');
  placeEdgeButton.style('font-size', '20px');
  placeEdgeButton.position(140, menuHeight / 2 - 10);
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  selectButton = createButton('Select');
  selectButton.style('background-color', buttonColor);
  selectButton.style('color', 'white');
  selectButton.style('font-size', '20px');
  selectButton.position(250, menuHeight / 2 - 10);
  selectButton.mousePressed(function() {
    mode = Mode.SELECT;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })


  stroke(0);
}

function drawMenu() {
  fill(menuColor);
  noStroke();
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
  // For each vertex in the adjacency list
  for (var i = 0; i < adjacencyList.length; i++) {
    v1 = adjacencyList[i][0];
    e = adjacencyList[i][1];
    x1 = v1.x;
    y1 = v1.y

    list_of_unique_vertices = e.filter((x, i, a) => a.indexOf(x) == i);
    list_of_lists_of_edges = [];
    for (var j = 0; j < list_of_unique_vertices.length; j++) {
      list_of_lists_of_edges.push(e.filter(x => x==list_of_unique_vertices[j]));
    }


    // For each list in the list of lists
    for (var j = 0; j < list_of_lists_of_edges.length; j++) {
      // For each edge in the list
      for (var k = 0; k < list_of_lists_of_edges[j].length; k++) {
        if (list_of_unique_vertices[j] >= i) {
          v2 = adjacencyList[list_of_unique_vertices[j]][0];
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
          num_edges = list_of_lists_of_edges[j].length;

          if (num_edges > 1) {
            d = dist(x1, y1, x2, y2);
            // move points perpendicular to the line
            bend_amount = ((1 / (num_edges+1)) * (k+1)) - 0.5;
            // 250 is the minimum bend amount
            bend_amount *= (d / 2) + 250;
            bend_amount *= num_edges/3;
            curve_x1 += bend_amount * ((y2 - y1) / d);
            curve_y1 += bend_amount * ((x1 - x2) / d);
            curve_x2 += bend_amount * ((y2 - y1) / d);
            curve_y2 += bend_amount * ((x1 - x2) / d);
            // Draw the edge
            stroke(0);
            noFill();
            curve(curve_x1, curve_y1, x1, y1, x2, y2, curve_x2, curve_y2);
          }
          else {
            // Draw the edge
            stroke(0);
            noFill();
            curve(curve_x1, curve_y1, x1, y1, x2, y2, curve_x2, curve_y2);
          }
        }
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
    // accounting for offset
    adjacencyList[selectionList[0]][0].x = mouseX - offsetX; 
    adjacencyList[selectionList[0]][0].y = mouseY - offsetY; 
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

    // Save offset from hit vertex to mouse
    offsetX = mouseX - adjacencyList[hit][0].x;
    offsetY = mouseY - adjacencyList[hit][0].y;    
  }

  updateVertexSelected(selectionList);

}

function updateVertexSelected(selectionList) {
  // set all vertices to unselected
  for (var i = 0; i < adjacencyList.length; i++) {
    adjacencyList[i][0].selected = false;
  }
  // set selected vertices to selected
  for (var i = 0; i < selectionList.length; i++) {
    adjacencyList[selectionList[i]][0].selected = true;
  }
}
