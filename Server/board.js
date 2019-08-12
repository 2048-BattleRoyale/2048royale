class Board {
  constructor() {
    this.boxes = [
      []
    ];
    this.nextTileId = 1;
    this.playersInGame = [];
  }

  addPlayer(sessionID, connection, name) {
    if (this.isFull()) return;

    this.playersInGame.push({
      sID: sessionID,
      connection: connection,
      name: name,
      score: 0
    });
  }

  isFull() {
    if (this.playersInGame.length >= 4) return true;
    else return false;
  }

  getPlayers() {
    return this.playersInGame;
  }

  getAsJSON() {
    var playersList = [];
    for (var i = 0; i < this.playersInGame.length; i++)
      playersList.push({
        name: this.playersInGame[i].name,
        score: this.playersInGame[i].score
      });

    return {
      players: playersList,
      boxes: this.boxes.flat()
    };
  }

  // Initialize a new boxes. Fill it with nulled elements and set up the initial boxes state.
  initBoard() {
    // Establish this.boxes array with nulled elements
    for (var r = 0; r < 14; r++) {
      // Add new row
      this.boxes.push([]);

      for (var c = 0; c < 14; c++) {
        // Add new col
        this.boxes[r].push({});

        this.boxes[r][c] = {
          enabled: false,
          tileNum: 0,
          tileId: 0,
          owner: 0
        };
      }
    }

    // Establish standard 4x4 grid of open spaces for players
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 2; c++) {
        for (var r_inner = 0; r_inner < 4; r_inner++) {
          for (var c_inner = 0; c_inner < 4; c_inner++) {
            this.boxes[(r * 6 + 2) + r_inner][(c * 6 + 2) + c_inner].enabled = true;
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

        this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileNum = 2;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].tileId = this.nextTileId;
        this.nextTileId++;

        // Obliterate this section
        this.boxes[(r * 6 + 2) + y][(c * 6) + x].tileNum = 2;
        this.boxes[(r * 6 + 2) + y][(c * 6) + x].tileId = this.nextTileId;
        this.boxes[(r * 6 + 2) + y][(c * 6) + x].owner = 1;
        this.nextTileId++;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 1) + x].tileNum = 2;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 1) + x].tileId = this.nextTileId;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 1) + x].owner = 1;
        this.nextTileId++;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 3) + x].tileNum = 2;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 3) + x].tileId = this.nextTileId;
        this.boxes[(r * 6 + 2) + y][(c * 6 + 3) + x].owner = 1;
        this.nextTileId++;

        if (r == 0 && c == 0) this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 1;
        else if (r == 0 && c == 1) this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 2;
        else if (r == 1 && c == 0) this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 3;
        else if (r == 1 && c == 1) this.boxes[(r * 6 + 2) + y][(c * 6 + 2) + x].owner = 4;
      }
    }
  }

  // Log the tile numbers and owners as well as the enabled/disabled state of each box.
  logTileInfo() {
    console.log();
    console.log("Tiles (number)\t\tTiles (owner)");

    for (var r = 0; r < this.boxes.length; r++) {
      var output = "";
      for (var c = 0; c < this.boxes[r].length; c++) {
        if (this.boxes[r][c].tileNum == 0) {
          if (this.boxes[r][c].enabled) output += " ";
          else output += "*";
        } else output += this.boxes[r][c].tileNum + "";
      }

      output += "\t\t";

      for (var c = 0; c < this.boxes[r].length; c++) {
        if (this.boxes[r][c].owner == 0) {
          if (this.boxes[r][c].enabled) output += " ";
          else output += "*";
        } else output += this.boxes[r][c].owner + "";
      }
      console.log(output);
    }
  }

  // Enable a new box on the this.boxes
  enableBox(x, y) {
    this.boxes[x][y].enabled = true;
  }

  // Handle the tile moving process, noting which tiles were moved in changeList
  handleTileMove(direction, player) {
    switch (direction) {
      case "up":
        // For all this.boxes except for the top row...
        for (var r = 1; r < 14; r++) {
          for (var c = 0; c < 14; c++) {
            // If the current tile is owned by the player moving around and there is
            // no tile in an enabled box upward, then move it up (by swapping the two)
            if (this.boxes[r][c].owner == player && this.boxes[r - 1][c].tileNum == 0 && this.boxes[r - 1][c].enabled) {
              // Are there more?
              var max_move = 1;
              while (this.boxes[r - max_move - 1][c].tileNum == 0 && this.boxes[r - max_move - 1][c].enabled) max_move++;

              var temp = this.boxes[r][c];
              this.boxes[r][c] = this.boxes[r - max_move][c];
              this.boxes[r - max_move][c] = temp;
            }
          }
        }
        break;

      case "down":
        // For all this.boxes except for the bottom row...
        for (var r = 13; r > 0; r--) {
          for (var c = 0; c < 14; c++) {
            // If the current tile is owned by the player moving around and there is
            // no tile in an enabled box downward, then move it down (by swapping the two)
            if (this.boxes[r][c].owner == player && this.boxes[r + 1][c].tileNum == 0 && this.boxes[r + 1][c].enabled) {
              // Are there more?
              var max_move = 1;
              while (this.boxes[r + max_move + 1][c].tileNum == 0 && this.boxes[r + max_move + 1][c].enabled) max_move++;

              var temp = this.boxes[r][c];
              this.boxes[r][c] = this.boxes[r + max_move][c];
              this.boxes[r + max_move][c] = temp;
            }
          }
        }
        break;

      case "left":
        // For all this.boxes except for the left-most column...
        for (var r = 0; r < 14; r++) {
          for (var c = 1; c < 14; c++) {
            // If the current tile is owned by the player moving around and there is
            // no tile in an enabled box leftward, then move it leftward (by swapping the two)
            if (this.boxes[r][c].owner == player && this.boxes[r][c - 1].tileNum == 0 && this.boxes[r][c - 1].enabled) {
              // Are there more?
              var max_move = 1;
              while (this.boxes[r][c - max_move - 1].tileNum == 0 && this.boxes[r][c - max_move - 1].enabled) max_move++;

              var temp = this.boxes[r][c];
              this.boxes[r][c] = this.boxes[r][c - max_move];
              this.boxes[r][c - max_move] = temp;
            }
          }
        }
        break;

      case "right":
        // For all this.boxes except for the right-most column...
        for (var r = 0; r < 14; r++) {
          for (var c = 13; c > 0; c--) {
            // If the current tile is owned by the player moving around and there is
            // no tile in an enabled box rightward, then move it rightward (by swapping the two)
            if (this.boxes[r][c].owner == player && this.boxes[r][c + 1].tileNum == 0 && this.boxes[r][c + 1].enabled) {
              // Are there more?
              var max_move = 1;
              while (this.boxes[r][c + max_move + 1].tileNum == 0 && this.boxes[r][c + max_move + 1].enabled) max_move++;

              var temp = this.boxes[r][c];
              this.boxes[r][c] = this.boxes[r][c + max_move];
              this.boxes[r][c + max_move] = temp;
            }
          }
        }
        break;

      default:
        console.log("ERROR: (handleBoardMoveDirection) direction isn't up/down/left/right");
        break;
    }
  }

  // Handle all aspects of a this.boxes move
  // TODO(Neil): Add tiles when move is executed
  handleBoardMove(direction, player) {
    switch (direction) {
      case "up":
        this.handleTileMove(direction, player);

        // For all this.boxes except for the bottom row...
        for (var r = 0; r < 13; r++) {
          for (var c = 0; c < 14; c++) {
            // If this box or the one below it isn't enabled, just go on to the next one.
            if (!this.boxes[r][c].enabled || !this.boxes[r + 1][c].enabled) continue;

            // If the tile crashing into the one above it isn't owned by the current player, move on.
            if (this.boxes[r + 1][c].owner != player) continue;

            // If this box and the one below it have the same number, squash them.
            if (this.boxes[r][c].tileNum == this.boxes[r + 1][c].tileNum) {
              // Temp store the number of the pre-merged blocks.
              var num = this.boxes[r][c].tileNum;

              // Create the new tile, with the incremented tileNum and tileID and correct player number.
              this.boxes[r][c] = {
                enabled: true,
                tileNum: (num * 2),
                tileId: this.nextTileId,
                owner: player
              };
              this.nextTileId++;

              // Empty the old tile below it.
              this.boxes[r + 1][c] = {
                enabled: true,
                tileNum: 0,
                tileId: 0,
                owner: 0
              };
            }
          }
        }

        this.handleTileMove(direction, player);

        // Add new tile to the bottom of the board.
        // In which columns does the player have tiles?
        var colsWithPlayerTiles = [];
        // Add the player's home board.
        if (player == 1 || player == 3) {
          colsWithPlayerTiles.push(2);
          colsWithPlayerTiles.push(3);
          colsWithPlayerTiles.push(4);
          colsWithPlayerTiles.push(5);
        } else {
          colsWithPlayerTiles.push(8);
          colsWithPlayerTiles.push(9);
          colsWithPlayerTiles.push(10);
          colsWithPlayerTiles.push(11);
        }

        for (var r = 0; r < this.boxes.length; r++) {
          for (var c = 0; c < this.boxes[r].length; c++) {
            if (this.boxes[r][c].owner == player) {
              var existsAlready = false;
              for (var i = 0; i < colsWithPlayerTiles.length; i++) {
                if (colsWithPlayerTiles[i] == c) {
                  existsAlready = true;
                  break; // Does this cause problems?
                }
              }

              if (!existsAlready) colsWithPlayerTiles.push(c);
            }
          }
        }

        // Identify the column and row combination that works.
        var viableBoxFound = false;
        var viableRow = -1;
        var viableCol = -1;
        do {
          var col = colsWithPlayerTiles[Math.floor(Math.random() * colsWithPlayerTiles.length)];

          // Players 1 and 2 have home boards at the top of the game board. We
          // need extra logic here...
          // Does this column have any connections between the top and bottom?
          if ((player == 1 || player == 2) &&
            !(this.boxes[6][col].enabled && this.boxes[7][col].enabled)) {
            // If not, find the first unlocked box from the bottom of the top
            // home board and record its column number.
            var firstUnlockedInCol = -1;
            for (var r = 5; r > 0; r--) {
              if (this.boxes[r][col].enabled) {
                firstUnlockedInCol = r;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[firstUnlockedInCol][col].tileId == 0) {
              viableBoxFound = true;
              viableRow = firstUnlockedInCol;
              viableCol = col;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              colsWithPlayerTiles = colsWithPlayerTiles.filter(item => ![col].includes(item))
            }
          } else {
            // From the bottom, find the first unlocked box and record its column number.
            var firstUnlockedInCol = -1;
            for (var r = this.boxes.length - 1; r > 0; r--) {
              if (this.boxes[r][col].enabled) {
                firstUnlockedInCol = r;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[firstUnlockedInCol][col].tileId == 0) {
              viableBoxFound = true;
              viableRow = firstUnlockedInCol;
              viableCol = col;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              colsWithPlayerTiles = colsWithPlayerTiles.filter(item => ![col].includes(item))
            }
          }
        } while (viableBoxFound == false && colsWithPlayerTiles.length != 0)

        // TODO(Neil): if viableRow == -1 and viableCol == -1, then the player has lost.

        // Create the new box at the specified location.
        // ~60% of the time select 2, 40% select 4.
        var newTileNum = Math.random() > 0.60 ? 4 : 2;
        this.boxes[viableRow][viableCol] = {
          enabled: true,
          tileNum: newTileNum,
          tileId: this.nextTileId,
          owner: player
        };
        this.nextTileId++;

        break;

      case "down":
        this.handleTileMove(direction, player);

        // For all this.boxes except for the top row...
        for (var r = 13; r > 0; r--) {
          for (var c = 0; c < 14; c++) {
            // If this box or the one above it isn't enabled, just go on to the next one.
            if (!this.boxes[r][c].enabled || !this.boxes[r - 1][c].enabled) continue;

            // If the tile crashing into the one below it isn't owned by the current player, move on.
            if (this.boxes[r - 1][c].owner != player) continue;

            // If this box and the one above it have the same number, squash them.
            if (this.boxes[r][c].tileNum == this.boxes[r - 1][c].tileNum) {
              // Temp store the number of the pre-merged blocks.
              var num = this.boxes[r][c].tileNum;

              // Create the new tile, with the incremented tileNum and tileID and correct player number.
              this.boxes[r][c] = {
                enabled: true,
                tileNum: (num * 2),
                tileId: this.nextTileId,
                owner: player
              };
              this.nextTileId++;

              // Empty the old tile above it.
              this.boxes[r - 1][c] = {
                enabled: true,
                tileNum: 0,
                tileId: 0,
                owner: 0
              };
            }
          }
        }

        this.handleTileMove(direction, player);

        // Add new tile to the top of the board.
        // In which columns does the player have tiles?
        var colsWithPlayerTiles = [];
        // Add the player's home board.
        if (player == 1 || player == 3) {
          colsWithPlayerTiles.push(2);
          colsWithPlayerTiles.push(3);
          colsWithPlayerTiles.push(4);
          colsWithPlayerTiles.push(5);
        } else {
          colsWithPlayerTiles.push(8);
          colsWithPlayerTiles.push(9);
          colsWithPlayerTiles.push(10);
          colsWithPlayerTiles.push(11);
        }

        for (var r = 0; r < this.boxes.length; r++) {
          for (var c = 0; c < this.boxes[r].length; c++) {
            if (this.boxes[r][c].owner == player) {
              var existsAlready = false;
              for (var i = 0; i < colsWithPlayerTiles.length; i++) {
                if (colsWithPlayerTiles[i] == c) {
                  existsAlready = true;
                  break; // Does this cause problems?
                }
              }

              if (!existsAlready) colsWithPlayerTiles.push(c);
            }
          }
        }

        // Identify the column and row combination that works.
        var viableBoxFound = false;
        var viableRow = -1;
        var viableCol = -1;
        do {
          var col = colsWithPlayerTiles[Math.floor(Math.random() * colsWithPlayerTiles.length)];

          // Players 3 and 4 have home boards at the bottom of the game board. We
          // need extra logic here...
          // Does this column have any connections between the top and bottom?
          if ((player == 3 || player == 4) &&
            !(this.boxes[6][col].enabled && this.boxes[7][col].enabled)) {
            // If not, find the first unlocked box from the top of the bottom
            // home board and record its column number.
            var firstUnlockedInCol = -1;
            for (var r = 8; r < this.boxes.length; r++) {
              if (this.boxes[r][col].enabled) {
                firstUnlockedInCol = r;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[firstUnlockedInCol][col].tileId == 0) {
              viableBoxFound = true;
              viableRow = firstUnlockedInCol;
              viableCol = col;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              colsWithPlayerTiles = colsWithPlayerTiles.filter(item => ![col].includes(item))
            }
          } else {
            // From the top, find the first unlocked box and record its column number.
            var firstUnlockedInCol = -1;
            for (var r = 0; r < this.boxes.length - 1; r++) {
              if (this.boxes[r][col].enabled) {
                firstUnlockedInCol = r;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[firstUnlockedInCol][col].tileId == 0) {
              viableBoxFound = true;
              viableRow = firstUnlockedInCol;
              viableCol = col;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              colsWithPlayerTiles = colsWithPlayerTiles.filter(item => ![col].includes(item))
            }
          }
        } while (viableBoxFound == false && colsWithPlayerTiles.length != 0)

        // TODO(Neil): if viableRow == -1 and viableCol == -1, then the player has lost.

        // Create the new box at the specified location.
        // ~60% of the time select 2, 40% select 4.
        var newTileNum = Math.random() > 0.60 ? 4 : 2;
        this.boxes[viableRow][viableCol] = {
          enabled: true,
          tileNum: newTileNum,
          tileId: this.nextTileId,
          owner: player
        };
        this.nextTileId++;

        break;

      case "left":
        this.handleTileMove(direction, player);

        // For all this.boxes except for the right row...
        for (var r = 0; r < 14; r++) {
          for (var c = 0; c < 13; c++) {
            // If this box or the to the right of it isn't enabled, just go on to the next one.
            if (!this.boxes[r][c].enabled || !this.boxes[r][c + 1].enabled) continue;

            // If the tile crashing into the one left of it isn't owned by the current player, move on.
            if (this.boxes[r][c + 1].owner != player) continue;

            // If this box and the one right of it have the same number, squash them.
            if (this.boxes[r][c].tileNum == this.boxes[r][c + 1].tileNum) {
              // Temp store the number of the pre-merged blocks.
              var num = this.boxes[r][c].tileNum;

              // Create the new tile, with the incremented tileNum and tileID and correct player number.
              this.boxes[r][c] = {
                enabled: true,
                tileNum: (num * 2),
                tileId: this.nextTileId,
                owner: player
              };
              this.nextTileId++;

              // Empty the old tile right of it.
              this.boxes[r][c + 1] = {
                enabled: true,
                tileNum: 0,
                tileId: 0,
                owner: 0
              };
            }
          }
        }

        this.handleTileMove(direction, player);

        // Add new tile to the right of the board.
        // In which rows does the player have tiles?
        var rowsWithPlayerTiles = [];
        // Add the player's home board.
        if (player == 1 || player == 2) {
          rowsWithPlayerTiles.push(2);
          rowsWithPlayerTiles.push(3);
          rowsWithPlayerTiles.push(4);
          rowsWithPlayerTiles.push(5);
        } else {
          rowsWithPlayerTiles.push(8);
          rowsWithPlayerTiles.push(9);
          rowsWithPlayerTiles.push(10);
          rowsWithPlayerTiles.push(11);
        }

        for (var r = 0; r < this.boxes.length; r++) {
          for (var c = 0; c < this.boxes[r].length; c++) {
            if (this.boxes[r][c].owner == player) {
              var existsAlready = false;
              for (var i = 0; i < rowsWithPlayerTiles.length; i++) {
                if (rowsWithPlayerTiles[i] == r) {
                  existsAlready = true;
                  break;
                }
              }

              if (!existsAlready) rowsWithPlayerTiles.push(r);
            }
          }
        }

        // Identify the column and row combination that works.
        var viableBoxFound = false;
        var viableRow = -1;
        var viableCol = -1;
        do {
          var row = rowsWithPlayerTiles[Math.floor(Math.random() * rowsWithPlayerTiles.length)];

          // Players 1 and 3 have home boards at the left of the game board. We
          // need extra logic here...
          // Does this row have any connections between the left and right?
          if ((player == 1 || player == 3) &&
            !(this.boxes[row][6].enabled && this.boxes[row][7].enabled)) {
            // If not, find the first unlocked box from the right of the top
            // home board and record its column number.
            var firstUnlockedInRow = -1;
            for (var c = 5; c > 0; c--) {
              if (this.boxes[row][c].enabled) {
                firstUnlockedInRow = c;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[row][firstUnlockedInRow].tileId == 0) {
              viableBoxFound = true;
              viableRow = row;
              viableCol = firstUnlockedInRow;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              rowsWithPlayerTiles = rowsWithPlayerTiles.filter(item => ![row].includes(item))
            }
          } else {
            // From the right, find the first unlocked box and record its column number.
            var firstUnlockedInRow = -1;
            for (var c = this.boxes[row].length - 1; c > 0; c--) {
              if (this.boxes[row][c].enabled) {
                firstUnlockedInRow = c;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[row][firstUnlockedInRow].tileId == 0) {
              viableBoxFound = true;
              viableRow = row;
              viableCol = firstUnlockedInRow;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              rowsWithPlayerTiles = rowsWithPlayerTiles.filter(item => ![row].includes(item))
            }
          }
        } while (viableBoxFound == false && rowsWithPlayerTiles.length != 0)

        // TODO(Neil): if viableRow == -1 and viableCol == -1, then the player has lost.

        // Create the new box at the specified location.
        // ~60% of the time select 2, 40% select 4.
        var newTileNum = Math.random() > 0.60 ? 4 : 2;
        this.boxes[viableRow][viableCol] = {
          enabled: true,
          tileNum: newTileNum,
          tileId: this.nextTileId,
          owner: player
        };
        this.nextTileId++;

        break;

      case "right":
        this.handleTileMove(direction, player);

        // For all this.boxes except for the left row...
        for (var r = 0; r < 14; r++) {
          for (var c = 13; c > 0; c--) {
            // If this box or the to the left of it isn't enabled, just go on to the next one.
            if (!this.boxes[r][c].enabled || !this.boxes[r][c - 1].enabled) continue;

            // If the tile crashing into the one right of it isn't owned by the current player, move on.
            if (this.boxes[r][c - 1].owner != player) continue;

            // If this box and the one left of it have the same number, squash them.
            if (this.boxes[r][c].tileNum == this.boxes[r][c - 1].tileNum) {
              // Temp store the number of the pre-merged blocks.
              var num = this.boxes[r][c].tileNum;

              // Create the new tile, with the incremented tileNum and tileID and correct player number.
              this.boxes[r][c] = {
                enabled: true,
                tileNum: (num * 2),
                tileId: this.nextTileId,
                owner: player
              };
              this.nextTileId++;

              // Empty the old tile left of it.
              this.boxes[r][c - 1] = {
                enabled: true,
                tileNum: 0,
                tileId: 0,
                owner: 0
              };
            }
          }
        }

        this.handleTileMove(direction, player);

        // Add new tile to the left of the board.
        // In which rows does the player have tiles?
        var rowsWithPlayerTiles = [];
        // Add the player's home board.
        if (player == 1 || player == 2) {
          rowsWithPlayerTiles.push(2);
          rowsWithPlayerTiles.push(3);
          rowsWithPlayerTiles.push(4);
          rowsWithPlayerTiles.push(5);
        } else {
          rowsWithPlayerTiles.push(8);
          rowsWithPlayerTiles.push(9);
          rowsWithPlayerTiles.push(10);
          rowsWithPlayerTiles.push(11);
        }

        for (var r = 0; r < this.boxes.length; r++) {
          for (var c = 0; c < this.boxes[r].length; c++) {
            if (this.boxes[r][c].owner == player) {
              var existsAlready = false;
              for (var i = 0; i < rowsWithPlayerTiles.length; i++) {
                if (rowsWithPlayerTiles[i] == r) {
                  existsAlready = true;
                  break;
                }
              }

              if (!existsAlready) rowsWithPlayerTiles.push(r);
            }
          }
        }

        // Identify the column and row combination that works.
        var viableBoxFound = false;
        var viableRow = -1;
        var viableCol = -1;
        do {
          var row = rowsWithPlayerTiles[Math.floor(Math.random() * rowsWithPlayerTiles.length)];

          // Players 2 and 4 have home boards at the right of the game board. We
          // need extra logic here...
          // Does this row have any connections between the left and right?
          if ((player == 2 || player == 4) &&
            !(this.boxes[row][6].enabled && this.boxes[row][7].enabled)) {
            // If not, find the first unlocked box from the right of the top
            // home board and record its column number.
            var firstUnlockedInRow = -1;
            for (var c = 8; c < this.boxes[row].length; c++) {
              if (this.boxes[row][c].enabled) {
                firstUnlockedInRow = c;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[row][firstUnlockedInRow].tileId == 0) {
              viableBoxFound = true;
              viableRow = row;
              viableCol = firstUnlockedInRow;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              rowsWithPlayerTiles = rowsWithPlayerTiles.filter(item => ![row].includes(item))
            }
          } else {
            // From the left, find the first unlocked box and record its column number.
            var firstUnlockedInRow = -1;
            for (var c = 0; c < this.boxes[row].length - 1; c++) {
              if (this.boxes[row][c].enabled) {
                firstUnlockedInRow = c;
                break;
              }
            }

            // If the first unlocked box in the column isn't occupied exit the loop.
            if (this.boxes[row][firstUnlockedInRow].tileId == 0) {
              viableBoxFound = true;
              viableRow = row;
              viableCol = firstUnlockedInRow;
            } else {
              // https://stackoverflow.com/a/20690490/3339274
              rowsWithPlayerTiles = rowsWithPlayerTiles.filter(item => ![row].includes(item))
            }
          }
        } while (viableBoxFound == false && rowsWithPlayerTiles.length != 0)

        // TODO(Neil): if viableRow == -1 and viableCol == -1, then the player has lost.

        // Create the new box at the specified location.
        // ~60% of the time select 2, 40% select 4.
        var newTileNum = Math.random() > 0.60 ? 4 : 2;
        this.boxes[viableRow][viableCol] = {
          enabled: true,
          tileNum: newTileNum,
          tileId: this.nextTileId,
          owner: player
        };
        this.nextTileId++;

        break;

      default:
        console.log("ERROR: (handleBoardMoveDirection) direction isn't up/down/left/right");
        break;
    }
  }
}

// JS can go to hell. https://stackoverflow.com/questions/32657516/how-to-properly-export-an-es6-class-in-node-4
module.exports = Board;