const readline = require('readline');

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
        owner: 0
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
      // var x = Math.trunc(Math.random() * 4);
      // var y = Math.trunc(Math.random() * 4);
      var x = 2;
      var y = 2;

      boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileNum = 2;
      boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileId = nextTileId;
      nextTileId++;

      // Obliterate this section
      boxes[(r * 6 + 1) + y][(c * 6 + 2) + x].tileNum = 2;
      boxes[(r * 6 + 1) + y][(c * 6 + 2) + x].tileId = nextTileId;
      boxes[(r * 6 + 1) + y][(c * 6 + 2) + x].owner = 1;
      nextTileId++;

      if (r == 0 && c == 0) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 1;
      else if (r == 0 && c == 1) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 2;
      else if (r == 1 && c == 0) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 3;
      else if (r == 1 && c == 1) boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 4;
    }
  }
}

// DEPRECIATED: Log the enabled/disabled state of each box. Superceded by logTileNul
function logEnabled(boxes) {
  console.log();
  console.log("Boxes (enabled)");

  for (var r = 0; r < boxes.length; r++) {
    // Skip if it's an empty array
    if (boxes[r] == []) continue;

    var output = "";
    for (var c = 0; c < boxes[r].length; c++) {
      output += boxes[r][c].enabled ? "T " : "F ";
    }
    console.log(output);
  }
}

// Log the tile numbers and enabled/disabled state of each box
function logTileNum(boxes) {
  console.log();
  console.log("Tiles (number)");
  for (var r = 0; r < boxes.length; r++) {
    var output = "";
    for (var c = 0; c < boxes[r].length; c++) {
      if (boxes[r][c].tileNum == 0) {
        if (boxes[r][c].enabled) output += " ";
        else output += "*";
      } else output += boxes[r][c].tileNum + "";
    }
    console.log(output);
  }
}

// Enable a new box on the board
function enableBox(boxes, x, y) {
  boxes[x][y].enabled = true;
}

// Handle the tile moving process
// TODO(Neil): Make a list of all of the moves made
function handleTileMove(board, direction, player) {
  if (direction === "up") {
    // For all boxes except for the top row...
    for (var r = 1; r < 14; r++) {
      for (var c = 0; c < 14; c++) {
        // If the current tile is owned by the player moving around and there is
        // no tile in an enabled box upward, then move it up (by swapping the two)
        if (board[r][c].owner == player && board[r - 1][c].tileNum == 0 && board[r - 1][c].enabled) {
          // Are there more?
          var max_move = 1;
          while (board[r - max_move - 1][c].tileNum == 0 && board[r - max_move - 1][c].enabled) max_move++;

          var temp = board[r][c];
          board[r][c] = board[r - max_move][c];
          board[r - max_move][c] = temp;
        }
      }
    }

  } else if (direction === "down") {
    // For all boxes except for the bottom row...
    for (var r = 13; r > 0; r--) {
      for (var c = 0; c < 14; c++) {
        // If the current tile is owned by the player moving around and there is
        // no tile in an enabled box downward, then move it down (by swapping the two)
        if (board[r][c].owner == player && board[r + 1][c].tileNum == 0 && board[r + 1][c].enabled) {
          // Are there more?
          var max_move = 1;
          while (board[r + max_move + 1][c].tileNum == 0 && board[r + max_move + 1][c].enabled) max_move++;

          var temp = board[r][c];
          board[r][c] = board[r + max_move][c];
          board[r + max_move][c] = temp;
        }
      }
    }

  } else if (direction === "left") {
    // For all boxes except for the left-most column...
    for (var r = 0; r < 14; r++) {
      for (var c = 1; c < 14; c++) {
        // If the current tile is owned by the player moving around and there is
        // no tile in an enabled box leftward, then move it leftward (by swapping the two)
        if (board[r][c].owner == player && board[r][c - 1].tileNum == 0 && board[r][c - 1].enabled) {
          // Are there more?
          var max_move = 1;
          while (board[r][c - max_move - 1].tileNum == 0 && board[r][c - max_move - 1].enabled) max_move++;

          var temp = board[r][c];
          board[r][c] = board[r][c - max_move];
          board[r][c - max_move] = temp;
        }
      }
    }

  } else if (direction === "right") {
    // For all boxes except for the right-most column...
    for (var r = 0; r < 14; r++) {
      for (var c = 13; c > 0; c--) {
        // If the current tile is owned by the player moving around and there is
        // no tile in an enabled box rightward, then move it rightward (by swapping the two)
        if (board[r][c].owner == player && board[r][c + 1].tileNum == 0 && board[r][c + 1].enabled) {
          // Are there more?
          var max_move = 1;
          while (board[r][c + max_move + 1].tileNum == 0 && board[r][c + max_move + 1].enabled) max_move++;

          var temp = board[r][c];
          board[r][c] = board[r][c + max_move];
          board[r][c + max_move] = temp;
        }
      }
    }

  } else console.log("ERROR: (handleBoardMoveDirection) direction isn't up/down/left/right");
}

// Handle all aspects of a board move
// TODO(Neil): Make a list of all of the moves and mergers
function handleBoardMove(board, nextTileId, direction, player) {
  if (direction === "up") {
    handleTileMove(board, direction, player);

  } else if (direction === "down") {
    handleTileMove(board, direction, player);

  } else if (direction === "left") {
    handleTileMove(board, direction, player);

  } else if (direction === "right") {
    handleTileMove(board, direction, player);

  } else console.log("ERROR: (handleBoardMoveDirection) direction isn't up/down/left/right");
}

//////////////////////////////

console.log("Initial Setup:");
initBoard(boxes, nextTileId);
logTileNum(boxes);

// console.log("Enable box (0, 0):");
// enableBox(boxes, 0, 0);
// logEnabled(boxes);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Move direction? ', (answer) => {
  console.log(answer);
  handleBoardMove(boxes, nextTileId, answer, 1);
  logTileNum(boxes);

  rl.close();
});