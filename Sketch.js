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
var input_text = '';
var enter_command = '';
var dragging = false;
var render_degree = false;

const Mode = {
  PLACE_VERTEX: 0,
  PLACE_EDGE: 1,
  SELECT: 2,
  DELETE_VERTEX: 3,
  DELETE_EDGE: 4,
  PLACE_LOOP: 5,
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
    this.name = '';
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
    if (this.name !== '') {
      text(this.name, this.x, this.y);
    }
    else {
      text(this.i, this.x, this.y);
    }

    // Draw degree of vertex
    if (render_degree) {
      textSize(15);
      textAlign(LEFT, TOP);
      strokeWeight(4);
      stroke(255);
      text('d: ' + adjacencyList[this.i][1].length, this.x + this.radius / 2, this.y - this.radius / 2);
    }
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
  placeVertexButton.mousePressed(function() {
    mode = Mode.PLACE_VERTEX;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  deleteVertexButton = createButton('Delete Vertex');
  deleteVertexButton.style('background-color', buttonColor);
  deleteVertexButton.style('color', 'white');
  deleteVertexButton.style('font-size', '20px');
  deleteVertexButton.mousePressed(function() {
    mode = Mode.DELETE_VERTEX;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.style('background-color', buttonColor);
  placeEdgeButton.style('color', 'white');
  placeEdgeButton.style('font-size', '20px');
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  deleteEdgeButton = createButton('Delete Edge');
  deleteEdgeButton.style('background-color', buttonColor);
  deleteEdgeButton.style('color', 'white');
  deleteEdgeButton.style('font-size', '20px');
  deleteEdgeButton.mousePressed(function() {
    mode = Mode.DELETE_EDGE;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  selectButton = createButton('Select');
  selectButton.style('background-color', buttonColor);
  selectButton.style('color', 'white');
  selectButton.style('font-size', '20px');
  selectButton.mousePressed(function() {
    mode = Mode.SELECT;
    // clear selection list
    while (selectionList.length > 0)
      selectionList.pop();
  })

  renameButton = createButton('Rename');
  renameButton.style('background-color', buttonColor);
  renameButton.style('color', 'white');
  renameButton.style('font-size', '20px');
  renameButton.mousePressed(function() {
    adjacencyList[selectionList[0]][0].name = input_text;
    renameBox.value('');
    input_text = '';
  })

  renameBox = createInput();
  renameBox.size(100, 30);
  renameBox.value('');
  renameBox.input(function() {
    input_text = renameBox.value();
  });

  enterCommandButton = createButton('Enter Command');
  enterCommandButton.style('background-color', buttonColor);
  enterCommandButton.style('color', 'white');
  enterCommandButton.style('font-size', '20px');
  enterCommandButton.mousePressed(function() {
    parseCommand(enter_command);
    enterCommandBox.value('');
    enter_command = '';
  });

  enterCommandBox = createInput();
  enterCommandBox.size(100, 30);
  enterCommandBox.value('');
  enterCommandBox.input(function() {
    enter_command = enterCommandBox.value();
  });

  renderDegreeBox = createCheckbox('Render Degree', false);
  renderDegreeBox.changed(function() {
    render_degree = !render_degree;
  });

  stroke(0);
  updateButtonColors();
  updateButtonPositions();
}

function parseCommand(command) {
  print('test');
  command = command.split(' ');
  if (command[0] === '/generate') {
    // check second argument
    if (command[1] == 'complete') {
      adjacencyList = [];
      num_vertices = command[2];
      for (var i = 0; i < num_vertices; i++) {
        // Generate in a circle
        x = windowWidth / 2 + (min(windowWidth, windowHeight) / 2.25) * cos((2*PI) / num_vertices * i);
        y = windowHeight / 2 + (min(windowWidth, windowHeight) / 2.25) * sin((2*PI) / num_vertices * i);
        adjacencyList.push([new Vertex(x, y, i), []]);
        for (var j = 0; j < i; j++) {
          adjacencyList[i][1].push(j);
          adjacencyList[j][1].push(i);
        }
      }
    
    }
    // other types of graphs
  }
  else if (command[0] === '/clear') {
    adjacencyList = [];
  }
  else if (command[0] === '/help') {
    print('Commands:');
    print('/generate [num_vertices] - Generates a random graph with num_vertices vertices');
    print('/clear - Clears the current graph');
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // update button positions
  updateButtonPositions();
}

function updateButtonPositions() {
  button_x_offset = ((windowWidth / 8) / 4);
  button_grid_unit = windowWidth / 10;
  placeVertexButton.position(button_grid_unit*0 + button_x_offset, menuHeight / 2 - 15);
  deleteVertexButton.position(button_grid_unit*1 + button_x_offset, menuHeight / 2 - 15);
  placeEdgeButton.position(button_grid_unit*2 + button_x_offset, menuHeight / 2 - 15);
  deleteEdgeButton.position(button_grid_unit*3 + button_x_offset, menuHeight / 2 - 15);
  selectButton.position(button_grid_unit*4 + button_x_offset, menuHeight / 2 - 15);
  renameButton.position(button_grid_unit*6 + button_x_offset, menuHeight / 2 - 15);
  renameBox.position(button_grid_unit*7 + button_x_offset, menuHeight / 2 - 15);
  enterCommandButton.position(button_grid_unit*8 + button_x_offset, menuHeight / 2 - 15);
  enterCommandBox.position(button_grid_unit*9 + button_x_offset, menuHeight / 2 - 15);
  renderDegreeBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2 - 15);
}

function drawMenu() {
  fill(menuColor);
  noStroke();
  rect(0, 0, windowWidth, menuHeight);
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
        // Check if loop
        if (list_of_unique_vertices[j] === i) {
          // Draw the loop
          stroke(edgeColor);
          strokeWeight(4);
          noFill();
          // Determine angle based on number of loops
          angle = (2*PI) / (list_of_lists_of_edges[j].length) * k;
          min_angle = PI / 4;
          angle_offset = (PI / 4) / (list_of_lists_of_edges[j].length) + min_angle;
          // Determine control points
          scale = 1000;
          curve_x1 = x1 + (scale * cos(angle));
          curve_y1 = y1 + (scale * sin(angle));
          curve_x2 = x1 + (scale * cos(angle + angle_offset));
          curve_y2 = y1 + (scale * sin(angle + angle_offset));
          curve(curve_x1, curve_y1, x1, y1, x1, y1, curve_x2, curve_y2);
        }
        else if (list_of_unique_vertices[j] >= i) {
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
            stroke(edgeColor);
            strokeWeight(4);
            noFill();
            curve(curve_x1, curve_y1, x1, y1, x2, y2, curve_x2, curve_y2);
          }
          else {
            // Draw the edge
            stroke(edgeColor);
            strokeWeight(4);
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

function drawInfo() {
  // Drawing info about edges and verticies
  fill(0);
  stroke(0);
  strokeWeight(1);
  textSize(20);
  textFont('Arial');
  textAlign(LEFT, TOP);
  text('Vertex Count: ' + adjacencyList.length, 10, menuHeight);
  edgeCount = 0;
  for (var i = 0; i < adjacencyList.length; i++) {
    for (var j = 0; j < adjacencyList[i][1].length; j++) {
      if (adjacencyList[i][1][j] >= i) {
        edgeCount += 1;
      }
    }
  }
  text('Edge Count: ' + edgeCount, 10, menuHeight + 30);

  // Total degree
  total_degree = 0;
  for (var i = 0; i < adjacencyList.length; i++) {
    total_degree += adjacencyList[i][1].length;
  }
  text('Total Degree: ' + total_degree, 10, menuHeight + 60);
}

function draw() {
  background(backgroundColor);
  drawMenu();

  if (mouseIsPressed === true && selectionList.length > 0 && mode === Mode.SELECT && dragging) {
    // accounting for offset
    adjacencyList[selectionList[0]][0].x = mouseX - offsetX; 
    adjacencyList[selectionList[0]][0].y = mouseY - offsetY; 
  }

  if (mouseIsPressed === false && mode === Mode.SELECT) {
    dragging = false;
  }

  drawAdjacencyList();
  drawInfo();
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
        adjacencyList[selectionList[0]][1].push(selectionList[1]);
        adjacencyList[selectionList[0]][0].strokeColor = "black";
        if (selectionList[0] != selectionList[1]) {
          adjacencyList[selectionList[1]][1].push(selectionList[0]);
          adjacencyList[selectionList[1]][0].strokeColor = "black";
        }
        while (selectionList.length > 0)
          selectionList.pop();
      }
    }
  }

  else if (mode === Mode.SELECT && hit > -1) {
    selectionList.push(hit);
    dragging = true;

    // Save offset from hit vertex to mouse
    offsetX = mouseX - adjacencyList[hit][0].x;
    offsetY = mouseY - adjacencyList[hit][0].y;    
  }

  else if (mode === Mode.DELETE_VERTEX) {
    if (hit !== -1) {
      adjacencyList.splice(hit, 1);
      for (var i = 0; i < adjacencyList.length; i++) {
        if (adjacencyList[i][1].includes(hit)) {
          adjacencyList[i][1] = adjacencyList[i][1].filter(x => x !== hit);
        }
      }
      updateVertexIndices();
    }
  }

  else if (mode === Mode.DELETE_EDGE) {
    if (hit !== -1) {
      selectionList.push(hit);
      if (selectionList.length === 2) {
        // catch loops
        if (selectionList[0] !== selectionList[1]) {
          for (var i = 0; i < adjacencyList[selectionList[0]][1].length; i++) {
            if (adjacencyList[selectionList[0]][1][i] === selectionList[1]) {
              adjacencyList[selectionList[0]][1].splice(i, 1);
              break;
            }
          }
        }
        for (var i = 0; i < adjacencyList[selectionList[1]][1].length; i++) {
          if (adjacencyList[selectionList[1]][1][i] === selectionList[0]) {
            adjacencyList[selectionList[1]][1].splice(i, 1);
            break;
          }
        }
        while (selectionList.length > 0)
          selectionList.pop();
      }
    }
  }

  // reduce selection list to 1 if it is greater than 1
  if (selectionList.length > 1) {
    selectionList.shift();
  }
  updateVertexSelected(selectionList);
  updateButtonColors();
  print(adjacencyList);
}

function updateVertexIndices() {
  for (var i = 0; i < adjacencyList.length; i++) {
    if (adjacencyList[i][0].i !== i) {
      for (var j = 0; j < adjacencyList.length; j++) {
        for (var k = 0; k < adjacencyList[j][1].length; k++) {
          if (adjacencyList[j][1][k] === adjacencyList[i][0].i) {
            adjacencyList[j][1][k] = i;
          }
        }
      }
      adjacencyList[i][0].i = i;
    }
  }
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

function updateButtonColors() {
  placeVertexButton.style('background-color', buttonColor);
  placeVertexButton.style('color', 'white');
  deleteVertexButton.style('background-color', buttonColor);
  deleteVertexButton.style('color', 'white');
  placeEdgeButton.style('background-color', buttonColor);
  placeEdgeButton.style('color', 'white');
  deleteEdgeButton.style('background-color', buttonColor);
  deleteEdgeButton.style('color', 'white');
  selectButton.style('background-color', buttonColor);
  selectButton.style('color', 'white');
  switch (mode) {
    case Mode.PLACE_VERTEX:
      placeVertexButton.style('background-color', selectedColor);
      placeVertexButton.style('color', 'black');
      break;
    case Mode.DELETE_VERTEX:
      deleteVertexButton.style('background-color', selectedColor);
      deleteVertexButton.style('color', 'black');
      break;
    case Mode.PLACE_EDGE:
      placeEdgeButton.style('background-color', selectedColor);
      placeEdgeButton.style('color', 'black');
      break;
    case Mode.DELETE_EDGE:
      deleteEdgeButton.style('background-color', selectedColor);
      deleteEdgeButton.style('color', 'black');
      break;
    case Mode.SELECT:
      selectButton.style('background-color', selectedColor);
      selectButton.style('color', 'black');
      break;
  }
}
