var backgroundColor = '#d1d1d1';
var menuColor = '#dbdbdb';
var vertexColor = '#85C7F2';
var edgeColor = '#000000';
var textColor = '#000000';
var buttonColor = '#636363';
var selectedColor = '#E4FF1A';
var vertexRadius = 50;
var adjacencyList = [];
var edgeList = [];
var menuHeight = 70;
var vertexSelectionList = [];
var edgeSelectionList = [];
var offsetX = 0;
var offsetY = 0;
var input_text = '';
var enter_command = '';
var dragging = false;
var render_degree = false;
var show_help = false;
var render_directions = false;

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

class Edge {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
    this.selected = false;
    this.color = null;

    this.middle_x = 0;
    this.middle_y = 0;
    this.radius = 14;

    // This var is for comparisons between edges, to tell if they are parellel
    this.parents = [this.head.i, this.tail.i];
    this.parents.sort();
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
    while (vertexSelectionList.length > 0)
      vertexSelectionList.pop();
  })

  deleteVertexButton = createButton('Delete Vertex');
  deleteVertexButton.style('background-color', buttonColor);
  deleteVertexButton.style('color', 'white');
  deleteVertexButton.style('font-size', '20px');
  deleteVertexButton.mousePressed(function() {
    mode = Mode.DELETE_VERTEX;
    // clear selection list
    while (vertexSelectionList.length > 0)
      vertexSelectionList.pop();
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.style('background-color', buttonColor);
  placeEdgeButton.style('color', 'white');
  placeEdgeButton.style('font-size', '20px');
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
    // clear selection list
    while (vertexSelectionList.length > 0)
      vertexSelectionList.pop();
  })

  deleteEdgeButton = createButton('Delete Edge');
  deleteEdgeButton.style('background-color', buttonColor);
  deleteEdgeButton.style('color', 'white');
  deleteEdgeButton.style('font-size', '20px');
  deleteEdgeButton.mousePressed(function() {
    mode = Mode.DELETE_EDGE;
    // clear selection list
    while (vertexSelectionList.length > 0)
      vertexSelectionList.pop();
  })

  selectButton = createButton('Select');
  selectButton.style('background-color', buttonColor);
  selectButton.style('color', 'white');
  selectButton.style('font-size', '20px');
  selectButton.mousePressed(function() {
    mode = Mode.SELECT;
    // clear selection list
    while (vertexSelectionList.length > 0)
      vertexSelectionList.pop();
  })

  renameButton = createButton('Rename');
  renameButton.style('background-color', buttonColor);
  renameButton.style('color', 'white');
  renameButton.style('font-size', '20px');
  renameButton.mousePressed(function() {
    adjacencyList[vertexSelectionList[0]][0].name = input_text;
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

  renderDirectionsBox = createCheckbox('Render Directions', false);
  renderDirectionsBox.changed(function() {
    render_directions = !render_directions;
  });

  helpButton = createButton('Help');
  helpButton.style('background-color', buttonColor);
  helpButton.style('color', 'white');
  helpButton.style('font-size', '20px');
  helpButton.mousePressed(function() {
    show_help = !show_help;
  });

  stroke(0);
  updateButtonColors();
  updateButtonPositions();
}

function updateButtonPositions() {
  button_x_offset = ((windowWidth / 8) / 4);
  button_grid_unit = windowWidth / 11;
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
  renderDirectionsBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2 + 15);
  helpButton.position(button_grid_unit*10 + button_x_offset, menuHeight / 2 - 15);
}

function parseCommand(command) {
  command = command.split(' ');
  if (command[0] === '/generate') {
    // check second argument
    if (command.length < 2) {
      print('Error: /generate requires a second argument');
      return;
    }
    else if (command[1] == 'random') {
      adjacencyList = [];
      edgeList = [];
      num_vertices = command[2];
      for (var i = 0; i < num_vertices; i++) {
        x = Math.floor(Math.random() * windowWidth * 0.8 + windowWidth * 0.1);
        y = Math.floor(Math.random() * windowHeight * 0.8 + windowHeight * 0.1);
        adjacencyList.push([new Vertex(x, y, i), []]);
      }
      for (var i = 0; i < num_vertices; i++) {
        for (var j = 0; j < num_vertices; j++) {
          if (Math.random() < 0.2 && i !== j) {
            num_parallel_edges = Math.floor(Math.random() * 3) + 1;
            for (var k = 0; k < num_parallel_edges; k++) {
              adjacencyList[i][1].push(j);
              edgeList.push(new Edge(adjacencyList[i][0], adjacencyList[j][0]));
            }
          }
        }
      }
    }
    else if (command[1] == 'cycle') {
      adjacencyList = [];
      edgeList = [];
      num_vertices = command[2];
      for (var i = 0; i < num_vertices; i++) {
        x = windowWidth / 2 + (min(windowWidth, windowHeight) / 2.25) * cos((2*PI) / num_vertices * i);
        y = windowHeight / 2 + (min(windowWidth, windowHeight) / 2.25) * sin((2*PI) / num_vertices * i);
        adjacencyList.push([new Vertex(x, y, i), []]);
        adjacencyList[i][1].push((i+1) % num_vertices);
        adjacencyList[i][1].push((i-1) % num_vertices);
        if (i > 0) {
          edgeList.push(new Edge(adjacencyList[i][0], adjacencyList[(i-1) % num_vertices][0]));
        }
      }
      // Connect the last vertex to the first
      adjacencyList[num_vertices-1][1].push(0);
      adjacencyList[0][1].push(num_vertices-1);
      edgeList.push(new Edge(adjacencyList[num_vertices-1][0], adjacencyList[0][0]));
    }
    else if (command[1] == 'complete') {
      adjacencyList = [];
      edgeList = [];
      num_vertices = command[2];
      for (var i = 0; i < num_vertices; i++) {
        // Generate in a circle
        x = windowWidth / 2 + (min(windowWidth, windowHeight) / 2.25) * cos((2*PI) / num_vertices * i);
        y = windowHeight / 2 + (min(windowWidth, windowHeight) / 2.25) * sin((2*PI) / num_vertices * i);
        adjacencyList.push([new Vertex(x, y, i), []]);
        for (var j = 0; j < i; j++) {
          adjacencyList[i][1].push(j);
          adjacencyList[j][1].push(i);
          edgeList.push(new Edge(adjacencyList[i][0], adjacencyList[j][0]));
        }
      }
    
    }
    // other types of graphs
  }
  else if (command[0] === '/clear') {
    adjacencyList = [];
    edgeList = [];
  }
  else if (command[0] === '/help') {
    show_help = !show_help;
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // update button positions
  updateButtonPositions();
}

function drawMenu() {
  fill(menuColor);
  noStroke();
  rect(0, 0, windowWidth, menuHeight);
}

function drawHelpScreen() {
  // Display help screen on canvas
  var help_screen_x = windowWidth - 10;
  var help_screen_y = 70;

  fill(0);
  stroke(0);
  textSize(20);
  textFont('Arial');
  textAlign(RIGHT, TOP);
  text('Commands:', help_screen_x, help_screen_y + 10);
  text('/clear - Clears the current graph', help_screen_x, help_screen_y + 70);
  text('/help - Displays this help screen', help_screen_x, help_screen_y + 100);
  text('/generate random - Generates a random graph with random number of vertices', help_screen_x, help_screen_y + 160);
  text('/generate cycle [num_vertices] - Generates a cycle graph with num_vertices vertices', help_screen_x, help_screen_y + 190);
  text('/generate complete [num_vertices] - Generates a complete graph with num_vertices vertices', help_screen_x, help_screen_y + 220);
  
}

// New draw edges based on edge list
function drawEdges() {
  fill(0);
  stroke(0);
  // Filter edge list into unique edges based on parents
  unique_edges = edgeList.filter((x, i, a) => a.findIndex(t => t.parents[0] === x.parents[0] && t.parents[1] === x.parents[1]) === i);
  // print('Unique Edges: ');
  // print(unique_edges);
  // For each unique edge, generate a list of edges that are parallel
  for (var i = 0; i < unique_edges.length; i++) {
    edge = unique_edges[i];
    // Find all edges that are parallel
    parallel_edges = edgeList.filter(x => x.parents[0] === edge.parents[0] && x.parents[1] === edge.parents[1] || x.parents[0] === edge.parents[1] && x.parents[1] === edge.parents[0]);
    // print('Parallel Edges: ');
    // print(parallel_edges);
    // Draw the edges
    for (var j = 0; j < parallel_edges.length; j++) {
      v1 = adjacencyList[parallel_edges[j].parents[0]][0];
      v2 = adjacencyList[parallel_edges[j].parents[1]][0];
      x1 = v1.x;
      y1 = v1.y;
      x2 = v2.x;
      y2 = v2.y;
      // Loop?
      if (v1 === v2) {
        // Draw the loop
        stroke(edgeColor);
        strokeWeight(4);
        noFill();
        // Determine angle based on number of loops
        angle = (2*PI) / (parallel_edges.length) * j;
        min_angle = PI / 4;
        angle_offset = (PI / 4) / (parallel_edges.length) + min_angle;
        // Determine control points
        scale = 1000;
        curve_x1 = x1 + (scale * cos(angle));
        curve_y1 = y1 + (scale * sin(angle));
        curve_x2 = x1 + (scale * cos(angle + angle_offset));
        curve_y2 = y1 + (scale * sin(angle + angle_offset));
        curve(curve_x1, curve_y1, x1, y1, x1, y1, curve_x2, curve_y2);
      }
      else {

        // creating control points that lie on the line between the two vertices
        scale = .2;
        curve_x1 = ((x1 - x2) * scale) + x1;
        curve_y1 = ((y1 - y2) * scale) + y1;
        curve_x2 = ((x2 - x1) * scale) + x2;
        curve_y2 = ((y2 - y1) * scale) + y2;

        // Number of edges between the two vertices
        num_edges = parallel_edges.length;

        if (num_edges > 1) {
          d = dist(x1, y1, x2, y2);
          // move points perpendicular to the line
          bend_amount = ((1 / (num_edges+1)) * (j+1)) - 0.5;
          // 250 is the minimum bend amount
          bend_amount *= (d / 2) + 250;
          bend_amount *= num_edges/3;
          curve_x1 += bend_amount * ((y2 - y1) / d);
          curve_y1 += bend_amount * ((x1 - x2) / d);
          curve_x2 += bend_amount * ((y2 - y1) / d);
          curve_y2 += bend_amount * ((x1 - x2) / d);

          // Draw the middle point
          middle_x = (x1 + x2) / 2;
          middle_y = (y1 + y2) / 2;
          middle_x -= bend_amount * ((y2 - y1) / d) / 8; // Turns out that 8 is the magic number
          middle_y -= bend_amount * ((x1 - x2) / d) / 8;
          parallel_edges[j].middle_x = middle_x;
          parallel_edges[j].middle_y = middle_y;

          if (parallel_edges[j].selected) {
            stroke(selectedColor);
            fill(selectedColor);
          }
          else if (parallel_edges[j].color !== null){
            stroke(parallel_edges[j].color);
            fill(parallel_edges[j].color);
          }
          else {
            stroke(edgeColor);
            fill(edgeColor);
          }
          
          // draw middle point
          strokeWeight(4);
          if (render_directions) {
            drawArrow(parallel_edges[j]);
          }
          else {
            strokeWeight(0);
            circle(middle_x, middle_y, parallel_edges[j].radius);
            strokeWeight(4);
          }
          // Draw the edge
          noFill();
          curve(curve_x1, curve_y1, x1, y1, x2, y2, curve_x2, curve_y2);
        }
        else {
          // Draw the middle point
          middle_x = (x1 + x2) / 2;
          middle_y = (y1 + y2) / 2;
          parallel_edges[j].middle_x = middle_x;
          parallel_edges[j].middle_y = middle_y;

          if (parallel_edges[j].selected) {
            stroke(selectedColor);
            fill(selectedColor);
          }
          else if (parallel_edges[j].color !== null){
            stroke(parallel_edges[j].color);
            fill(parallel_edges[j].color);
          }
          else {
            stroke(edgeColor);
            fill(edgeColor);
          }
          
          // draw middle point
          strokeWeight(4);
          if (render_directions) {
            drawArrow(parallel_edges[j]);
          }
          else {
            strokeWeight(0);
            circle(middle_x, middle_y, parallel_edges[j].radius);
            strokeWeight(4);
          }
          // Draw the edge
          noFill();
          line(x1, y1, x2, y2);
        }
      }
    }
  }

}

function drawArrow(edge) {
  x = edge.middle_x;
  y = edge.middle_y;
  head = edge.head;
  tail = edge.tail;
  // Draw an arrow at x1, y1 pointing towards head
  // Angle of the arrow
  angle = atan2(head.y - tail.y, head.x - tail.x);
  // Length of the arrow
  size = 5;
  // Draw the arrow
  push();
  translate(x, y);
  rotate(angle);
  // fill(edge.color);
  // stroke(edge.color);
  // strokeWeight(4); 

  line(0, 0, size, -size);
  line(0, 0, size, size);

  pop();
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

  if (mouseIsPressed === true && vertexSelectionList.length > 0 && mode === Mode.SELECT && dragging) {
    // accounting for offset
    adjacencyList[vertexSelectionList[0]][0].x = mouseX - offsetX; 
    adjacencyList[vertexSelectionList[0]][0].y = mouseY - offsetY; 
  }

  if (mouseIsPressed === false && mode === Mode.SELECT) {
    dragging = false;
  }

  drawAdjacencyList();
  drawInfo();
  if (show_help) {
    drawHelpScreen();
  }
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

function edgeHit() {
  hit = -1;
  for (var i = 0; i < edgeList.length; i++) {
    e = edgeList[i];
    if (mouseHitTest(e.middle_x - e.radius / 2, e.middle_y - e.radius / 2, e.middle_x + e.radius / 2, e.middle_y + e.radius / 2)) {
      hit = i;
      break;
    }
  }
  return hit;
}

function hitTest() {
  // This function returns a tuple of the type of hit and the index of the hit
  // [0, index] is a vertex hit
  // [1, index] is an edge hit
  type = -1;
  hit = vertexHit();
  type = 0;
  if (hit === -1) {
    hit = edgeHit();
    type = 1;
  }
  return [type, hit];
}

// test each vertex for a hit
// can be made faster with dictionary if too slow
// if no hit place a new vertex
// if hit try to connect two vertices with edge
function mousePressed() {
  hit = hitTest();

  if (mode === Mode.PLACE_VERTEX) {
    if (mouseY > menuHeight + vertexRadius / 2)
      adjacencyList.push([new Vertex(mouseX, mouseY, adjacencyList.length), []]);
  }

  else if (mode === Mode.PLACE_EDGE) {
    if (hit[1] != -1 && hit[0] === 0) {
      vertexSelectionList.push(hit[1]);
      if (vertexSelectionList.length === 2) {
        adjacencyList[vertexSelectionList[0]][1].push(vertexSelectionList[1]);
        adjacencyList[vertexSelectionList[0]][0].strokeColor = "black";
        edgeList.push(new Edge(adjacencyList[vertexSelectionList[1]][0], adjacencyList[vertexSelectionList[0]][0]));
        if (vertexSelectionList[0] != vertexSelectionList[1]) {
          adjacencyList[vertexSelectionList[1]][1].push(vertexSelectionList[0]);
          adjacencyList[vertexSelectionList[1]][0].strokeColor = "black";
        }
        while (vertexSelectionList.length > 0)
          vertexSelectionList.pop();
      }
    }
  }

  else if (mode === Mode.SELECT && hit[1] > -1 && hit[0] === 0) {
    vertexSelectionList.push(hit[1]);
    dragging = true;

    // Save offset from hit vertex to mouse
    offsetX = mouseX - adjacencyList[hit[1]][0].x;
    offsetY = mouseY - adjacencyList[hit[1]][0].y;    
  }

  else if (mode === Mode.SELECT && hit[1] > -1 && hit[0] === 1) {
    edgeSelectionList = [];
    edgeSelectionList.push(hit[1]);
  }

  else if (mode === Mode.DELETE_VERTEX) {
    if (hit[1] !== -1 && hit[0] === 0) {
      adjacencyList.splice(hit[1], 1);
      for (var i = 0; i < adjacencyList.length; i++) {
        if (adjacencyList[i][1].includes(hit[1])) {
          adjacencyList[i][1] = adjacencyList[i][1].filter(x => x !== hit[1]);
        }
      }
      for (var i = 0; i < edgeList.length; i++) {
        if (edgeList[i].parents[0] === hit[1] || edgeList[i].parents[1] === hit[1]) {
          edgeList.splice(i, 1);
          i -= 1;
        }
      }
      updateVertexIndices(hit[1]);
    }
  }

  else if (mode === Mode.DELETE_EDGE) {
    if (hit[1] !== -1 && hit[0] === 1) {
      v1 = edgeList[hit[1]].parents[0];
      v2 = edgeList[hit[1]].parents[1];
      // Adjacency list
      // catch loops
      if (v1 !== v2) {
        for (var i = 0; i < adjacencyList[v1][1].length; i++) {
          if (adjacencyList[v1][1][i] === v2) {
            adjacencyList[v1][1].splice(i, 1);
            break;
          }
        }
      }
      for (var i = 0; i < adjacencyList[v2][1].length; i++) {
        if (adjacencyList[v2][1][i] === v1) {
          adjacencyList[v2][1].splice(i, 1);
          break;
        }
      }
      // Edge list
      for (var i = 0; i < edgeList.length; i++) {
        if (edgeList[i].parents[0] === v1 && edgeList[i].parents[1] === v2 || edgeList[i].parents[0] === v2 && edgeList[i].parents[1] === v1) {
          edgeList.splice(i, 1);
          break;
        }
      }

      while (vertexSelectionList.length > 0)
        vertexSelectionList.pop(); 
    }
  }

  // reduce selection list to 1 if it is greater than 1
  if (vertexSelectionList.length > 1) {
    vertexSelectionList.shift();
  }
  updateVertexSelected(vertexSelectionList);
  updateEdgeSelected(edgeSelectionList);
  updateButtonColors();
  print(adjacencyList);
  print(edgeList);
}

function updateVertexIndices(vertex_deleted) {
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
  for (var i = 0; i < edgeList.length; i++) {
    if (edgeList[i].parents[0] >= vertex_deleted) {
      edgeList[i].parents[0] -= 1;
    }
    if (edgeList[i].parents[1] >= vertex_deleted) {
      edgeList[i].parents[1] -= 1;
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

function updateEdgeSelected(selectionList) {
  // set all edges to unselected
  for (var i = 0; i < edgeList.length; i++) {
    edgeList[i].selected = false;
  }
  // set selected edges to selected
  for (var i = 0; i < selectionList.length; i++) {
    edgeList[selectionList[i]].selected = true;
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
