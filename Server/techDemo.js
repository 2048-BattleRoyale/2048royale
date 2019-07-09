var boxes = [
  []
];
var nextTileId = 1;

// Initialize a new board. Fill it with nulled elements and set up the initial board state.
function initBoard(boxes, nextTileId) {
  // Establish boxes array with nulled elements
  for (var r = 0; r < 14; r++) {
    // Add new row
    boxes.push([]);

    for (var c = 0; c < 14; c++) {
      // Add new col
      boxes[r].push({});

      boxes[r][c] = {
        enabled: false,
        tileNum: 0,
        tileId: 0,
        owner: 0,
        justMerged: false
      }
    }
  }

  // Establish standard 4x4 grid of open spaces for players
  for (var r = 0; r < 2; r++) {
    for (var c = 0; c < 2; c++) {
      for (var r_inner = 0; r_inner < 4; r_inner++) {
        for (var c_inner = 0; c_inner < 4; c_inner++) {
          boxes[(r * 6 + 2) + r_inner][(c * 6 + 2) + c_inner].enabled = true;
        }
      }
    }
  }

  // Create first "2" tile for each player
  for (var r = 0; r < 2; r++) {
    for (var c = 0; c < 2; c++) {
      // Randomize coordinates within the 4x4 space
      var x = Math.trunc(Math.random() * 4);
      var y = Math.trunc(Math.random() * 4);

      boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileNum = 2;
      boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileId = nextTileId;
      nextTileId++;
      if (r == 0 && c == 0) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 1;
      else if (r == 0 && c == 1) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 2;
      else if (r == 1 && c == 0) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 3;
      else if (r == 1 && c == 1) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 4;
    }
  }
}

function logEnabled(boxes) {
  console.log("\n");
  console.log("Boxes (enabled)");

  for (var r = 0; r < boxes.length; r++) {
    var output = "";
    for (var c = 0; c < boxes[r].length; c++) {
      output += boxes[r][c].enabled + "\t";
    }
    console.log(output);
  }
}

function logTileNum(boxes) {
  console.log("\n");
  console.log("Tiles (number)");
  for (var r = 0; r < boxes.length; r++) {
    var output = "";
    for (var c = 0; c < boxes[r].length; c++) {
      if (boxes[r][c].tileNum == 0) output += "\t"
      else output += boxes[r][c].tileNum + "\t";
    }
    console.log(output);
  }
}

function enableBox(boxes, x, y) {
  boxes[x][y].enabled = true;
}

//////////////////////////////

console.log("Initial Setup:\n");
initBoard(boxes, nextTileId);
logEnabled(boxes);
logTileNum(boxes);

console.log("Enable box (0, 0):\n");
enableBox(boxes, 0, 0);
logEnabled(boxes);
