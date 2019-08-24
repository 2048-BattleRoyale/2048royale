const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const Board = require("./board.js");

const debugMsgs = true;
const httpPort = 7000;
const wsPort = 8000;
const oldBoardTimeout = 20 /* mins */ * 60 /* secs */ * 1000 /* ms */ ;
const timeBetweenOldBoardCleanupPasses = 1 /* mins */ * 60 /* secs */ * 1000 /* ms */ ;
console.log("CONFIG: http on port:\t" + httpPort);
console.log("CONFIG: ws on port:\t" + wsPort);

// TODOS:
// - Implement system to garbage collect unused boards. (done?)
// - Implement detection of game end and time limit (20 mins?)
// - Implement client function to let server know that the client has been closed.

// {Board, Board, Board, ...}
var boardsList = [];
boardsList.remove = function (index) {
  // https://stackoverflow.com/a/53069926/3339274
  numToRemove = 1;
  this.splice(index, numToRemove);
}

// Log a message to the terminal.
// critical (bool): Is the message critical or debug?
// msg (string): Message to print.
function logMsg(critical, msg) {
  if (critical) {
    console.log("CRITICAL ERR: " + msg);
  } else if (debugMsgs) {
    console.log(msg);
  }
}

// Creates a random string of characters length characters long.
function makeSessionID(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// Send board update to all players in the board.
function sendBoardUpdate(board) {
  for (var i = 0; i < board.getPlayers().length; i++) {
    // logMsg(false, "Sending to sessionID: " + board.getPlayers()[i].sID)
    board.getPlayers()[i].connection.send(JSON.stringify({
      msgType: "boardUpdate",
      board: board.getAsArray()
    }));
  }
}

// Find the board that this player is on.
// ws (websocket connection): WebSocket to use for a possible error message.
// sessionID (string): sessionID of the query user.
function findPlayersBoard(ws, sessionID) {
  var board = null;
  for (var i = 0; i < boardsList.length; i++) {
    var playersList = boardsList[i].getPlayers();
    for (var j = 0; j < playersList.length; j++) {
      if (playersList[j].sID === sessionID) {
        board = boardsList[i];
        break;
      }
    }
  }

  // IF no board was found, error out.
  if (board == null) {
    ws.send(JSON.stringify({
      msgType: "ERR",
      err: "Board not found"
    }));
    return null;
  } else return board;
}

function cleanUpOldBoards() {
  for (var i = 0; i < boardsList.length; i++) {
    logMsg(false, "Cleaning up old boards.");
    var creationTime = boardsList[i].getWhenGameBegan().getTime();

    // If the board hasn't started yet, then don't delete it, you buffoon!
    if (creationTime == 0) continue;

    // If the board has been around longer than it's allowed to, clean it up.
    if ((new Date()).getTime() - creationTime > oldBoardTimeout) {
      // Send the cleanup message to all players.
      for (var i = 0; i < board.getPlayers().length; i++) {
        logMsg(false, "Sending board cleanup to sessionID: " + board.getPlayers()[i].sID)
        board.getPlayers()[i].connection.send(JSON.stringify({
          msgType: "gameTimeout",
        }));
      }

      // Remove the board from the list.
      boardsList.remove(i);
    }
  }
}

// Handles an incoming WebSockets message.
// ws (websocket connection): WebSocket to use for communication with the current client.
// msg (JSON string): Non-parsed JSON string with the message body.
function handleWsMessage(ws, msg) {
  var parsedMsg = JSON.parse(msg);

  switch (parsedMsg.msgType) {
    case "signup":
      logMsg(false, "Signup message received. Name: " + parsedMsg.name + ", sID:" +
        parsedMsg.sessionID);
      // Look for boards which have less than a full set of players.
      var freeBoard = -1;
      for (var i = 0; i < boardsList.length; i++) {
        if (!boardsList[i].isFull()) freeBoard = i;
      }

      // If there were no free boards, create one.
      if (freeBoard == -1) {
        boardsList.push(new Board());
        freeBoard = boardsList.length - 1;
      }

      // Add the player to the board.
      boardsList[freeBoard].addPlayer(parsedMsg.sessionID, ws, parsedMsg.name);
      // If this made the board full, then start the game.
      if (boardsList[freeBoard].isFull()) {
        // Initialize the board, so that it has boxes.
        boardsList[freeBoard].initBoard();

        // Tell all players that the game is starting and send the first board object.
        var playersList = boardsList[freeBoard].getPlayers();
        for (var i = 0; i < playersList.length; i++) {
          logMsg(false, "Sending game starting message to board: " + freeBoard + ", player: " + i)
          playersList[i].connection.send(JSON.stringify({
            msgType: "gameStarting"
          }));
          playersList[i].connection.send(JSON.stringify({
            msgType: "boardUpdate",
            board: boardsList[freeBoard].getAsArray()
          }));
        }
        // Else, tell all players that the game how many players still need to join.
      } else {
        logMsg(false, "Nope, just sending waiting message.")
        var playersList = boardsList[freeBoard].getPlayers();
        var numLeft = 4 - playersList.length;
        for (var i = 0; i < playersList.length; i++) {
          playersList[i].connection.send(JSON.stringify({
            msgType: "waitingForPlayers",
            numLeft: numLeft
          }));
        }
      }
      break;
    case "clientClosed":
      logMsg(false, "Client closed message received. sID:" + parsedMsg.sessionID);
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, delete the gosh darn player!
      if (board == null) {
        logMsg(true, "Error!: Board not found for sessionID: " +
          parsedMsg.sessionID);
      } else {
        board.removePlayer(sessionID);
      }
      break;
    case "playerMove":
      logMsg(false, "Player move message received. sID:" + parsedMsg.sessionID +
        ", Direction: " + parsedMsg.direction);
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, handle the gosh darn box!
      if (board == null) {
        logMsg(true, "Error!: Board not found for sessionID: " +
          parsedMsg.sessionID);
      } else {
        var player;
        for (var i = 0; i < board.getPlayers().length; i++) {
          if (board.getPlayers()[i].sID == sessionID) {
            player = i + 1;
            break;
          }
        }
        if (player == null) {
          logMsg(true, "Error!: Player not found in board for sessionID: " +
            parsedMsg.sessionID);
        } else {
          board.handleBoardMove(parsedMsg.direction, player);
          sendBoardUpdate(board);
        }
      }
      break;
    case "unlockBox":
      logMsg(false, "Box unlock message received. sID:" + parsedMsg.sessionID +
        ", x: " + parsedMsg.x + ", y: " + parsedMsg.y);
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, enable the gosh darn box!
      if (board == null) {
        logMsg(true, "Error!: Board not found for sessionID: " +
          parsedMsg.sessionID)
      } else {
        board.enableBox(parsedMsg.x, parsedMsg.y);
        sendBoardUpdate(board);
      }
      break;
    default:
      logMsg(true, "Error!: Unrecognized received. Message: " + parsedMsg);
      ws.send(JSON.stringify({
        msgType: "ERR",
        err: "Invalid message type"
      }));
      break;
  }
}

// *****************************************************************************
// HTTP and WebSockets Server init and setup.
// *****************************************************************************

// Setup periodic cleanup of old boards.
// https://stackoverflow.com/a/1224485/3339274
var cleanupHandle = setInterval(cleanUpOldBoards, timeBetweenOldBoardCleanupPasses);
//clearInterval(cleanupHandle)

// Start HTTP Server to listen for new clients to sign in.
http.createServer(function (request, response) {
  response.writeHead(200, {
    // 'Content-type': 'text/plain'
    'Content-type': 'text/html'
  });

  pathName = url.parse(request.url).pathname;
  query = url.parse(request.url).query;
  logMsg(false, "HTTP Query: {pathName: " + pathName + ", query: " + query + "}");

  // Send the client a unique session id.
  var sessionID = "";
  var unique = true;
  do {
    sessionID = makeSessionID(8);

    // Is this session ID already assigned to someone?
    for (var i = 0; i < boardsList.length; i++) {
      var playersList = boardsList[i].getPlayers;
      for (var j = 0; j < playersList.length; j++) {
        if (playersList[j].sID === sessionID) unique = false;
      }
    }
  } while (!unique)

  response.write(sessionID);
  response.end();
}).listen(httpPort);

// Start WebSocket Server to listen for new players making moves/actions.
const wsserver = new WebSocket.Server({
  port: wsPort
});
wsserver.on('connection', function connection(websocket) {
  websocket.on('message', function incoming(msg) {
    logMsg(false, "WebSocket message received: " + msg);
    handleWsMessage(websocket, msg);
  });
});