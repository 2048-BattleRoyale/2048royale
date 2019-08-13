const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const Board = require("./board.js");

const debugMsgs = true;
const httpPort = 7000;
const wsPort = 8000;
console.log("CONFIG: http on port:\t" + httpPort);
console.log("CONFIG: ws on port:\t" + wsPort);

// {Board, Board, Board, ...}
var boardsList = [];

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
// sesssionID (string): sessionID of the query user.
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

// Handles an incoming WebSockets message.
// ws (websocket connection): WebSocket to use for communication with the current client.
// msg (JSON string): Non-parsed JSON string with the message body.
function handleWsMessage(ws, msg) {
  // ws.send(msg);
  var parsedMsg = JSON.parse(msg);

  switch (parsedMsg.msgType) {
    case "signup":
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
          // logMsg(false, "Sending game starting message to board: " + freeBoard + ", player: " + i)
          playersList[i].connection.send(JSON.stringify({
            msgType: "gameStarting"
          }));
          playersList[i].connection.send(JSON.stringify({
            msgType: "boardUpdate",
            board: boardsList[freeBoard].getAsArray()
          }));
        }
      } else { // Tell all players that the game how many players still need to join.
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
    case "playerMove":
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, handle the gosh darn box!
      if (board != null) {
        board.handleBoardMove(parsedMsg.direction);
        sendBoardUpdate(board);
      }
      break;
    case "unlockBox":
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, enable the gosh darn box!
      if (board != null) {
        board.enableBox(parsedMsg.x, parsedMsg.y);
        sendBoardUpdate(board);
      }
      break;
    default:
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
    logMsg(false, "WebSocket message: " + msg);
    handleWsMessage(websocket, msg);
  });
});