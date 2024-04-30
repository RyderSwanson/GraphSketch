var backgroundColor = '#d1d1d1';
var menuColor = '#dbdbdb';
var vertexColor = '#85C7F2';
var edgeColor = '#000000';
var textColor = '#000000';
var buttonColor = '#636363';
var selectedColor = '#E4FF1A';
var vertexRadius = 50;
var adjacencyList = [];
var adjacencyMatrix = [];
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
var number_of_components = 0;
var chromatic_number = 0;
var is_bipartite = false;
var render_bridges = false;
var render_info = false;
var current_text_box = '';
var repel = false;
var gravity = false;
var mouse_x_last_frame = 0;
var mouse_y_last_frame = 0;
var gravity_strength = 0.05;
var spring_edge_length = 500;
var spring_edge_strength = 0.21;

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

    // For repelling verticies
    this.dx = 0;
    this.dy = 0;
    this.last_frame_x = 0;
    this.last_frame_y = 0;
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

    if (repel) {
      stepRepelVerticies();
    }
  }
}

class Edge {
  constructor(head, tail) {
    this.head = head;
    this.tail = tail;
    this.selected = false;
    this.is_bridge = false;
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
    vertexSelectionList = [];
    edgeSelectionList = [];
  })

  deleteVertexButton = createButton('Delete Vertex');
  deleteVertexButton.style('background-color', buttonColor);
  deleteVertexButton.style('color', 'white');
  deleteVertexButton.style('font-size', '20px');
  deleteVertexButton.mousePressed(function() {
    mode = Mode.DELETE_VERTEX;
    // clear selection list
    vertexSelectionList = [];
    edgeSelectionList = [];
  })

  placeEdgeButton = createButton('Place Edge');
  placeEdgeButton.style('background-color', buttonColor);
  placeEdgeButton.style('color', 'white');
  placeEdgeButton.style('font-size', '20px');
  placeEdgeButton.mousePressed(function() {
    mode = Mode.PLACE_EDGE;
    // clear selection list
    vertexSelectionList = [];
    edgeSelectionList = [];
  })

  deleteEdgeButton = createButton('Delete Edge');
  deleteEdgeButton.style('background-color', buttonColor);
  deleteEdgeButton.style('color', 'white');
  deleteEdgeButton.style('font-size', '20px');
  deleteEdgeButton.mousePressed(function() {
    mode = Mode.DELETE_EDGE;
    // clear selection list
    vertexSelectionList = [];
    edgeSelectionList = [];
  })

  selectButton = createButton('Select');
  selectButton.style('background-color', buttonColor);
  selectButton.style('color', 'white');
  selectButton.style('font-size', '20px');
  selectButton.mousePressed(function() {
    mode = Mode.SELECT;
    // clear selection list
    vertexSelectionList = [];
    edgeSelectionList = [];
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
    current_text_box = 'rename';
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
    current_text_box = 'enter_command';
  });

  renderDegreeBox = createCheckbox('Render Degree', false);
  renderDegreeBox.changed(function() {
    render_degree = !render_degree;
  });

  renderDirectionsBox = createCheckbox('Render Directions', false);
  renderDirectionsBox.changed(function() {
    render_directions = !render_directions;
  });

  renderBridgesBox = createCheckbox('Render Bridges', false);
  renderBridgesBox.changed(function() {
    render_bridges = !render_bridges;
  });

  renderInfoBox = createCheckbox('Render Info', false);
  renderInfoBox.changed(function() {
    render_info = !render_info;
  });

  repelBox = createCheckbox('Repel', false);
  repelBox.changed(function() {
    repel = !repel;
  });

  gravityBox = createCheckbox('Gravity', false);
  gravityBox.changed(function() {
    gravity = !gravity;
  });

  gravitySlider = createSlider(0, 100, gravity_strength * 400);
  gravitySlider.input(function() {
    gravity_strength = gravitySlider.value() / 400;
  });

  springEdgeLengthSlider = createSlider(0, 800, spring_edge_length);
  springEdgeLengthSlider.input(function() {
    spring_edge_length = springEdgeLengthSlider.value();
  });

  springEdgeStrengthSlider = createSlider(0, 200, spring_edge_strength * 100);
  springEdgeStrengthSlider.input(function() {
    spring_edge_strength = springEdgeStrengthSlider.value() / 100;
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

  renderDegreeBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2 - 30);
  renderDirectionsBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2 - 15);
  renderBridgesBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2);
  renderInfoBox.position(button_grid_unit*5 + button_x_offset, menuHeight / 2 + 15);

  repelBox.position(button_grid_unit*6 + button_x_offset, menuHeight / 2 - 30);
  gravityBox.position(button_grid_unit*6 + button_x_offset, menuHeight / 2 - 15);
  
  gravitySlider.position(button_grid_unit*7 + button_x_offset, menuHeight / 2 - 30);
  springEdgeLengthSlider.position(button_grid_unit*7 + button_x_offset, menuHeight / 2 - 15);
  springEdgeStrengthSlider.position(button_grid_unit*7 + button_x_offset, menuHeight / 2);

  renameButton.position(button_grid_unit*8 + button_x_offset, menuHeight / 2 + 5);
  renameBox.position(button_grid_unit*8 + button_x_offset, menuHeight / 2 - 30);

  enterCommandButton.position(button_grid_unit*9 + button_x_offset, menuHeight / 2 + 5);
  enterCommandBox.position(button_grid_unit*9 + button_x_offset, menuHeight / 2 - 30);

  helpButton.position(button_grid_unit*10 + button_x_offset, menuHeight / 2 - 15);
}

function parseCommand(command) {
  command = command.split(' ');
  if (command[0] === '/gen' || command[0] === '/generate') {
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
              adjacencyList[j][1].push(i);
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
  // Cartesian product
  else if (command[0] === '/x') {
    // check second argument
    if (command.length < 2) {
      print('Error: /x requires a second argument');
      return;
    }
    else if (command[1] == 'cycle') {
      // This command generates the cartesian product of the current graph with a cycle graph
      // The cycle graph is generated with the number of verticies defined by the second argument
      // We first generate xy coordinates for the cycle graph
      // then we create a local copy of the adjacency list (call it G)
      // we then create an instance of G for each vertex in the cycle graph
      // we then connect the vertices in each G instance to the corresponding vertex in the cycle graph

      // Generate the cycle graph
      num_vertices = command[2];
      cycle_graph = [];
      for (var i = 0; i < num_vertices; i++) {
        x = windowWidth / 2 + (min(windowWidth, windowHeight) / 4) * cos((2*PI) / num_vertices * i);
        y = windowHeight / 2 + (min(windowWidth, windowHeight) / 4) * sin((2*PI) / num_vertices * i);
        cycle_graph.push([new Vertex(x, y, i), []]);
        cycle_graph[i][1].push((i+1) % num_vertices);
        cycle_graph[i][1].push((i-1) % num_vertices);
      }

      // Take a local copy
      g = adjacencyList.slice();
      e = edgeList.slice();


      // Normalizing g
      // Get x min and max
      x_min = 100000;
      x_max = -100000;
      for (var i = 0; i < g.length; i++) {
        if (g[i][0].x < x_min) {
          x_min = g[i][0].x;
        }
        if (g[i][0].x > x_max) {
          x_max = g[i][0].x;
        }
      }
      // Get y min and max
      y_min = 100000;
      y_max = -100000;
      for (var i = 0; i < g.length; i++) {
        if (g[i][0].y < y_min) {
          y_min = g[i][0].y;
        }
        if (g[i][0].y > y_max) {
          y_max = g[i][0].y;
        }
      }
      // Get averages
      x_avg = (x_max + x_min) / 2;
      y_avg = (y_max + y_min) / 2;
      // Translate g to the origin
      for (var i = 0; i < g.length; i++) {
        g[i][0].x -= x_avg;
        g[i][0].y -= y_avg;
      }
      // Scale g so that its span is 1/5 of the window size
      scale = min(windowWidth, windowHeight) / 5;
      for (var i = 0; i < g.length; i++) {
        g[i][0].x /= (x_max - x_min);
        g[i][0].y /= (y_max - y_min);
        g[i][0].x *= scale;
        g[i][0].y *= scale;
      }
      // Done normalizing g


      // Clear graph
      adjacencyList = [];
      edgeList = [];
      // Generate num_verticies instances of g
      for (var i = 0; i < num_vertices; i++) {
        for (var j = 0; j < g.length; j++) {
          adjacencyList.push([new Vertex(g[j][0].x + cycle_graph[i][0].x, g[j][0].y + cycle_graph[i][0].y, i * g.length + j), []]);
          // Add adjacencies
          for (var k = 0; k < g[j][1].length; k++) {
            adjacencyList[i * g.length + j][1].push(i * g.length + g[j][1][k]);
          }
        }
        // add edges based on e
        for (var j = 0; j < e.length; j++) {
          v1 = e[j].parents[0];
          v2 = e[j].parents[1];
          // Add edge between corresponding vertices in the cycle graph
          edgeList.push(new Edge(adjacencyList[i * g.length + v1][0], adjacencyList[i * g.length + v2][0]));
        }
        
        // add edges between instances of g
        if (i > 0) {
          for (var j = 0; j < g.length; j++) {
            edgeList.push(new Edge(adjacencyList[(i-1) * g.length + j][0], adjacencyList[i * g.length + j][0]));
          }
        }
      }
      // Connect the last instance of g to the first
      for (var i = 0; i < g.length; i++) {
        edgeList.push(new Edge(adjacencyList[(num_vertices-1) * g.length + i][0], adjacencyList[i][0]));
      }
    }
    // Complete Graph
    else if (command[1] == 'complete') {
      // This command generates the cartesian product of the current graph with a complete graph
      // The complete graph is generated with the number of verticies defined by the second argument
      // We first generate xy coordinates for the complete graph
      // then we create a local copy of the adjacency list (call it G)
      // we then create an instance of G for each vertex in the complete graph
      // we then connect the vertices in each G instance to the corresponding vertex in the complete graph

      // Generate the complete graph
      num_vertices = command[2];
      complete_graph = [];
      complete_edge_list = [];
      for (var i = 0; i < num_vertices; i++) {
        // Generate in a circle
        x = windowWidth / 2 + (min(windowWidth, windowHeight) / 4) * cos((2*PI) / num_vertices * i);
        y = windowHeight / 2 + (min(windowWidth, windowHeight) / 4) * sin((2*PI) / num_vertices * i);
        complete_graph.push([new Vertex(x, y, i), []]);
        for (var j = 0; j < i; j++) {
          complete_graph[i][1].push(j);
          complete_graph[j][1].push(i);
          complete_edge_list.push(new Edge(complete_graph[i][0], complete_graph[j][0]));
        }
      }

      // Take a local copy
      g = adjacencyList.slice();
      e = edgeList.slice();


      // Normalizing g
      // Get x min and max
      x_min = 100000;
      x_max = -100000;
      for (var i = 0; i < g.length; i++) {
        if (g[i][0].x < x_min) {
          x_min = g[i][0].x;
        }
        if (g[i][0].x > x_max) {
          x_max = g[i][0].x;
        }
      }
      // Get y min and max
      y_min = 100000;
      y_max = -100000;
      for (var i = 0; i < g.length; i++) {
        if (g[i][0].y < y_min) {
          y_min = g[i][0].y;
        }
        if (g[i][0].y > y_max) {
          y_max = g[i][0].y;
        }
      }
      // Get averages
      x_avg = (x_max + x_min) / 2;
      y_avg = (y_max + y_min) / 2;
      // Translate g to the origin
      for (var i = 0; i < g.length; i++) {
        g[i][0].x -= x_avg;
        g[i][0].y -= y_avg;
      }
      // Scale g so that its span is 1/5 of the window size
      scale = min(windowWidth, windowHeight) / 5;
      for (var i = 0; i < g.length; i++) {
        g[i][0].x /= (x_max - x_min);
        g[i][0].y /= (y_max - y_min);
        g[i][0].x *= scale;
        g[i][0].y *= scale;
      }
      // Done normalizing g


      // Clear graph
      adjacencyList = [];
      edgeList = [];
      // Generate num_verticies instances of g
      for (var i = 0; i < num_vertices; i++) {
        for (var j = 0; j < g.length; j++) {
          adjacencyList.push([new Vertex(g[j][0].x + complete_graph[i][0].x, g[j][0].y + complete_graph[i][0].y, i * g.length + j), []]);
          // Add adjacencies
          for (var k = 0; k < g[j][1].length; k++) {
            adjacencyList[i * g.length + j][1].push(i * g.length + g[j][1][k]);
          }
        }
        // add edges based on e
        for (var j = 0; j < e.length; j++) {
          v1 = e[j].parents[0];
          v2 = e[j].parents[1];
          // Add edge between corresponding vertices in the complete graph
          edgeList.push(new Edge(adjacencyList[i * g.length + v1][0], adjacencyList[i * g.length + v2][0]));
        }

        
      }
      // add edges between instances of g using complete_edge_list
      for (var i = 0; i < g.length; i++) {
        for (var j = 0; j < complete_edge_list.length; j++) {
          v1 = complete_edge_list[j].parents[0];
          v2 = complete_edge_list[j].parents[1];
          // Convert v1 and v2 to the correct vertex in the current instance of g
          v1 = v1 * g.length + i;
          v2 = v2 * g.length + i;
          edgeList.push(new Edge(adjacencyList[v1][0], adjacencyList[v2][0]));
        }
      }
    }
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
  text('/generate random [num_verticies] ((or /gen))- Generates a random graph with num_vertices vertices', help_screen_x, help_screen_y + 160);
  text('/generate cycle [num_vertices] ((or /gen))- Generates a cycle graph with num_vertices vertices', help_screen_x, help_screen_y + 190);
  text('/generate complete [num_vertices] ((or /gen))- Generates a complete graph with num_vertices vertices', help_screen_x, help_screen_y + 220);
  text('/x cycle [num_vertices] - Generates the cartesian product of the current graph with a cycle graph', help_screen_x, help_screen_y + 250);
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

        // Find midpoint
        middle_x = x1 - (scale / 11) * cos(angle + angle_offset / 2);
        middle_y = y1 - (scale / 11) * sin(angle + angle_offset / 2);
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
        // Draw the middle point
        strokeWeight(0);
        circle(middle_x, middle_y, parallel_edges[j].radius);
        // Draw the edge
        strokeWeight(4);
        noFill();
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

      if (render_bridges) {
        if (parallel_edges[j].is_bridge) {
          parallel_edges[j].color = 'red';
        }
        else {
          parallel_edges[j].color = null;
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

  // Number of connected components
  text('Number of Components: ' + number_of_components, 10, menuHeight + 90);

  // Bipartite
  text('Bipartite: ' + is_bipartite, 10, menuHeight + 120);

  // Adjacency matrix
  text('Adjacency Matrix:', 10, menuHeight + 180);
  // print edge numbers
  adjacencyListNumbers = [];
  for (var i = 0; i < adjacencyList.length; i++) {
    adjacencyListNumbers.push(i);
  }
  text('v: ' + adjacencyListNumbers, 10, menuHeight + 210);
  for (var i = 0; i < adjacencyMatrix.length; i++) {
    text(i + ': ' + adjacencyMatrix[i], 10, menuHeight + 240 + 30 * i);
  }

  // Eigenvalue
  text('Eigenvalue: ' + eigenvalue, 10, menuHeight + 240 + 30 * adjacencyMatrix.length);


  // Chromatic number
  text('Chromatic Number: ' + chromatic_number, 10, menuHeight + 270 + 30 * adjacencyMatrix.length);

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
  if (render_info) {
    drawInfo();
  }
  if (show_help) {
    drawHelpScreen();
  }
  // Draw labels for sliders
  fill(0);
  stroke(0);
  textSize(12);
  textFont('Arial');
  textAlign(RIGHT, TOP);
  text('Gravity: ' + gravity_strength, button_grid_unit*7 + button_x_offset, menuHeight / 2 - 30);
  text('Distance: ' + spring_edge_length, button_grid_unit*7 + button_x_offset, menuHeight / 2 - 15);
  text('Repulsion: ' + spring_edge_strength, button_grid_unit*7 + button_x_offset, menuHeight / 2);

  mouse_x_last_frame = mouseX;
  mouse_y_last_frame = mouseY;
}

function keyPressed() {
  updateInfo();
  if (keyCode === ENTER && current_text_box === 'rename') {
    adjacencyList[vertexSelectionList[0]][0].name = input_text;
    renameBox.value('');
    input_text = '';
  }
  if (keyCode === ENTER && current_text_box === 'enter_command') {
    parseCommand(enter_command);
    enterCommandBox.value('');
    enter_command = '';
  }
  if (keyCode === DELETE && mode === Mode.SELECT && vertexSelectionList.length > 0) {
    deleteVertex(vertexSelectionList[0]);
  }
  if (keyCode === DELETE && mode === Mode.SELECT && edgeSelectionList.length > 0) {
    deleteEdge(edgeSelectionList[0]);
  }
  if (enter_command === '' && current_text_box === '') {
    // 'c' key
    if (keyCode === 67) {
      // Clear graph
      adjacencyList = [];
      edgeList = [];
    }
    // 'r' key
    if (keyCode === 82) {
      // Random graph
      adjacencyList = [];
      edgeList = [];
      num_vertices = 10;
      for (var i = 0; i < num_vertices; i++) {
        x = Math.floor(Math.random() * windowWidth * 0.8 + windowWidth * 0.1);
        y = Math.floor(Math.random() * windowHeight * 0.8 + windowHeight * 0.1);
        adjacencyList.push([new Vertex(x, y, i), []]);
      }
      for (var i = 0; i < num_vertices; i++) {
        for (var j = 0; j < num_vertices; j++) {
          if (Math.random() < 0.2 && i !== j) {
            // Generate a random number that is most of the time 1
            if (Math.random() < 0.5) {
              num_parallel_edges = 1;
            }
            else if (Math.random() < 0.75) {
              num_parallel_edges = 0;
            }
            else {
              num_parallel_edges = Math.floor(Math.random() * 3) + 1;
            }
            for (var k = 0; k < num_parallel_edges; k++) {
              adjacencyList[i][1].push(j);
              adjacencyList[j][1].push(i);
              edgeList.push(new Edge(adjacencyList[i][0], adjacencyList[j][0]));
            }
          }
        }
      }
    }
    // 'h' key
    if (keyCode === 72) {
      show_help = !show_help;
    }
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
        edgeList.push(new Edge(adjacencyList[vertexSelectionList[0]][0], adjacencyList[vertexSelectionList[1]][0]));
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
    edgeSelectionList = [];
    vertexSelectionList.push(hit[1]);
    dragging = true;

    // Save offset from hit vertex to mouse
    offsetX = mouseX - adjacencyList[hit[1]][0].x;
    offsetY = mouseY - adjacencyList[hit[1]][0].y;    
  }

  else if (mode === Mode.SELECT && hit[1] > -1 && hit[0] === 1) {
    vertexSelectionList = [];
    edgeSelectionList = [];
    edgeSelectionList.push(hit[1]);
  }

  else if (mode === Mode.DELETE_VERTEX) {
    if (hit[1] !== -1 && hit[0] === 0) {
      deleteVertex(hit[1]);
    }
  }

  else if (mode === Mode.DELETE_EDGE) {
    if (hit[1] !== -1 && hit[0] === 1) {
      deleteEdge(hit[1]);
    }
  }

  // reduce selection list to 1 if it is greater than 1
  if (vertexSelectionList.length > 1) {
    vertexSelectionList.shift();
  }
  updateInfo();
  print(adjacencyList);
  print(edgeList);
}

function updateInfo() {
  updateVertexSelected(vertexSelectionList);
  updateEdgeSelected(edgeSelectionList);
  updateButtonColors();
  updateAdjacencyMatrix();
  number_of_components = detectNumberOfComponents();
  is_bipartite = detectBipartite();
  chromatic_number = calculateChromaticNumber();
  detectBridges();
  eigenvalue = calculateEigenvalues();
}

function deleteVertex(vertex) {
  adjacencyList.splice(vertex, 1);
  for (var i = 0; i < adjacencyList.length; i++) {
    if (adjacencyList[i][1].includes(vertex)) {
      adjacencyList[i][1] = adjacencyList[i][1].filter(x => x !== vertex);
    }
  }
  for (var i = 0; i < edgeList.length; i++) {
    if (edgeList[i].parents[0] === vertex || edgeList[i].parents[1] === vertex) {
      edgeList.splice(i, 1);
      i -= 1;
    }
  }
  updateVertexIndices(vertex);
}

function deleteEdge(vertex) {
  v1 = edgeList[vertex].parents[0];
  v2 = edgeList[vertex].parents[1];
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

function updateAdjacencyMatrix() {
  // Update the adjacency matrix
  adjacencyMatrix = [];
  // Set size of matrix
  for (var i = 0; i < adjacencyList.length; i++) {
    adjacencyMatrix.push(new Array(adjacencyList.length).fill(0));
  }
  for (var i = 0; i < adjacencyList.length; i++) {
    for (var j = 0; j < adjacencyList.length; j++) {
      // get count of edges between i and j
      count = 0;
      for (var k = 0; k < adjacencyList[i][1].length; k++) {
        if (adjacencyList[i][1][k] === j) {
          count += 1;
        }
      }
      adjacencyMatrix[i][j] = count;
    }
  }
}

// Detection functions
function detectNumberOfComponents() {
  // Detect the number of connected components in the graph
  // Use a depth first search to detect the number of connected components
  visited = [];
  for (var i = 0; i < adjacencyList.length; i++) {
    visited.push(false);
  }
  num_components = 0;
  for (var i = 0; i < adjacencyList.length; i++) {
    if (!visited[i]) {
      num_components += 1;
      componentsDFS(i, visited);
    }
  }
  return num_components;
}

function componentsDFS(vertex, visited) {
  visited[vertex] = true;
  for (var i = 0; i < adjacencyList[vertex][1].length; i++) {
    if (!visited[adjacencyList[vertex][1][i]]) {
      componentsDFS(adjacencyList[vertex][1][i], visited);
    }
  }
}

function detectBipartite() {
  // Detect if the graph is bipartite
  // Use a depth first search to detect if the graph is bipartite
  visited = [];
  for (var i = 0; i < adjacencyList.length; i++) {
    visited.push(false);
  }
  colors = [];
  for (var i = 0; i < adjacencyList.length; i++) {
    colors.push(-1);
  }
  for (var i = 0; i < adjacencyList.length; i++) {
    if (!visited[i]) {
      colors[i] = 0;
      if (!bipartiteDFS(i, visited, colors)) {
        return false;
      }
    }
  }
  return true;
}

function bipartiteDFS(vertex, visited, colors) {
  visited[vertex] = true;
  for (var i = 0; i < adjacencyList[vertex][1].length; i++) {
    if (!visited[adjacencyList[vertex][1][i]]) {
      colors[adjacencyList[vertex][1][i]] = 1 - colors[vertex];
      if (!bipartiteDFS(adjacencyList[vertex][1][i], visited, colors)) {
        return false;
      }
    }
    else if (colors[adjacencyList[vertex][1][i]] === colors[vertex]) {
      return false;
    }
  }
  return true;
}


function detectBridges() {
  // reset bridge status of all edges
  for (var i = 0; i < edgeList.length; i++) {
    edgeList[i].is_bridge = false;
  }
  timer = 0;
  n = adjacencyList.length;
  visited = new Array(n).fill(false);
  tin = new Array(n).fill(-1);
  low = new Array(n).fill(-1);
  for (let i = 0; i < n; ++i) {
    if (!visited[i])
    bridgeDFS(i);
}
}

function bridgeDFS(v, p = -1) {
  visited[v] = true;
  tin[v] = low[v] = timer++;
  adj = adjacencyList.map(x => x[1]);
  for (let to of adj[v]) {
    if (to === p) continue;
    if (visited[to]) {
      low[v] = Math.min(low[v], tin[to]);
    } else {
      bridgeDFS(to, v);
      low[v] = Math.min(low[v], low[to]);
      if (low[to] > tin[v]) {
        // Set edge to be a bridge
        for (let i = 0; i < edgeList.length; i++) {
          if (edgeList[i].parents[0] === v && edgeList[i].parents[1] === to || edgeList[i].parents[0] === to && edgeList[i].parents[1] === v) {
            edgeList[i].is_bridge = true;
          }
        }
      }
    }
  }
}

function calculateChromaticNumber() {
  // Calculate the chromatic number of the graph
  // Use a greedy algorithm to calculate the chromatic number
  chromatic_number = 0;
  colors = [];
  for (var i = 0; i < adjacencyList.length; i++) {
    colors.push(-1);
  }
  for (var i = 0; i < adjacencyList.length; i++) {
    available = [];
    for (var j = 0; j < adjacencyList.length; j++) {
      available.push(true);
    }
    for (var j = 0; j < adjacencyList[i][1].length; j++) {
      if (colors[adjacencyList[i][1][j]] !== -1) {
        available[colors[adjacencyList[i][1][j]]] = false;
      }
    }
    for (var j = 0; j < adjacencyList.length; j++) {
      if (available[j]) {
        colors[i] = j;
        chromatic_number = max(chromatic_number, j + 1);
        break;
      }
    }
  }
  return chromatic_number;
}

function calculateEigenvalues() {
  // Calculate the eigenvalues of the adjacency matrix
  // Use the power iteration method
  // Set the initial vector to be the all ones vector
  n = adjacencyMatrix.length;
  v = new Array(n).fill(1);
  for (var i = 0; i < 100; i++) {
    v = matrixVectorMultiply(adjacencyMatrix, v);
    v = scalarVectorMultiply(1 / normalize(v), v);
  }
  return dot(v, matrixVectorMultiply(adjacencyMatrix, v)) / dot(v, v);
}

function normalize(v) {
  // Normalize a vector
  sum = 0;
  for (var i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
}

function matrixVectorMultiply(matrix, vector) {
  // Multiply a matrix by a vector
  result = [];
  for (var i = 0; i < matrix.length; i++) {
    sum = 0;
    for (var j = 0; j < matrix.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push(sum);
  }
  return result;
}

function scalarVectorMultiply(scalar, vector) {
  // Multiply a vector by a scalar
  result = [];
  for (var i = 0; i < vector.length; i++) {
    result.push(scalar * vector[i]);
  }
  return result;
}

function dot(v1, v2) {
  // Calculate the dot product of two vectors
  result = 0;
  for (var i = 0; i < v1.length; i++) {
    result += v1[i] * v2[i];
  }
  return result;
}



// Simulation stuff
function calculateForce(vertex) {
  // Calculate the force on the vertex
  // The force is the sum of the forces from all other vertices
  force = [0, 0];
  for (var i = 0; i < adjacencyList.length; i++) {
    if (i !== vertex) {
      // Calculate the force between vertex and i
      f = calculateForceBetweenVertices(vertex, i);
      force[0] += f[0];
      force[1] += f[1];
    }
  }

  // If out of bounds, add a force to move the vertex back into bounds
  if (adjacencyList[vertex][0].x - (adjacencyList[vertex][0].radius/2) < 0) {
    force[0] -= adjacencyList[vertex][0].x - (adjacencyList[vertex][0].radius/2);
  }
  if (adjacencyList[vertex][0].x + (adjacencyList[vertex][0].radius/2) > windowWidth) {
    force[0] += windowWidth - adjacencyList[vertex][0].x - (adjacencyList[vertex][0].radius/2);
  }
  if (adjacencyList[vertex][0].y + (adjacencyList[vertex][0].radius/2) > windowHeight) {
    force[1] += windowHeight - adjacencyList[vertex][0].y - (adjacencyList[vertex][0].radius/2);
  }
  if (adjacencyList[vertex][0].y - (adjacencyList[vertex][0].radius/2) < menuHeight) {
    force[1] += menuHeight - adjacencyList[vertex][0].y + (adjacencyList[vertex][0].radius/2);
  }

  return force;
}

function calculateForceBetweenVertices(v1, v2) {
  // Calculate the force between two vertices
  // The force is proportional to the inverse square of the distance between the vertices
  // The force is attractive if the vertices are connected by an edge
  // The force is repulsive if the vertices are not connected by an edge
  x1 = adjacencyList[v1][0].x;
  y1 = adjacencyList[v1][0].y;
  x2 = adjacencyList[v2][0].x;
  y2 = adjacencyList[v2][0].y;
  d = dist(x1, y1, x2, y2);
  f = [0, 0];
  if (adjacencyList[v1][1].includes(v2)) {
    // Add a spring force to the force
    // spring_constant = 0.21;
    spring_constant = spring_edge_strength;
    // spring_length = 500;
    spring_length = spring_edge_length;
    d = dist(x1, y1, x2, y2);
    f[0] += spring_constant * (d - spring_length) * (x2 - x1) / d;
    f[1] += spring_constant * (d - spring_length) * (y2 - y1) / d;
    // dampen
    f[0] *= 0.1;
    f[1] *= 0.1;
  }
  else {
    // Add a spring force to the force
    spring_constant = 0.001;
    spring_length = 700;
    d = dist(x1, y1, x2, y2);
    f[0] += spring_constant * (d - spring_length) * (x2 - x1) / d;  
    f[1] += spring_constant * (d - spring_length) * (y2 - y1) / d;

    // dampen
    f[0] *= 0.1;
    f[1] *= 0.1;
  }

  // scale force
  force_constant = 0.05;
  f[0] *= force_constant;
  f[1] *= force_constant;



  return f;
}

function stepRepelVerticies() {
  // Update the positions of the vertices based on the forces
  for (var i = 0; i < adjacencyList.length; i++) {
    max_vel = 50;

    f = calculateForce(i);
    adjacencyList[i][0].dx += f[0];
    adjacencyList[i][0].dy += f[1];
    
    if (gravity) {
      // Add a force to pull the vertex down
      adjacencyList[i][0].dy += gravity_strength;
    }
    
    // Air resistance
    adjacencyList[i][0].dx *= 0.99;
    adjacencyList[i][0].dy *= 0.99;
    
    // Limit the velocity of the vertex
    if (adjacencyList[i][0].dx > max_vel) {
      adjacencyList[i][0].dx = max_vel;
    }
    if (adjacencyList[i][0].dx < -max_vel) {
      adjacencyList[i][0].dx = -max_vel;
    }
    if (adjacencyList[i][0].dy > max_vel) {
      adjacencyList[i][0].dy = max_vel;
    }
    if (adjacencyList[i][0].dy < -max_vel) {
      adjacencyList[i][0].dy = -max_vel;
    }

    if (adjacencyList[i][0].selected === true && dragging === true) {
      // vertex is being dragged, so set the velocity to the calculated speed
      adjacencyList[i][0].dx = mouseX - mouse_x_last_frame;
      adjacencyList[i][0].dy = mouseY - mouse_y_last_frame;
    }
    else {
      // Update the position of the vertex
      adjacencyList[i][0].x += adjacencyList[i][0].dx;
      adjacencyList[i][0].y += adjacencyList[i][0].dy;
    }
  }
}