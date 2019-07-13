const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const Board = require("./board.js");

const httpPort = 7000;
const wsPort = 8000;

// {Board, Board, Board}
var boardsList = [];

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
  for (var i = 0; i < board.getPlayers.length; i++) {
    board.getPlayers[i].connection.send({
      msgType: "boardUpdate",
      board: board.getAsJSON()
    });
  }
}

// Start HTTP Server.
http.createServer(function (request, response) {
  response.writeHead(200, {
    // 'Content-type': 'text/plain'
    'Content-type': 'text/html'
  });
  // response.write('Hello Node JS Server Response');
  // response.end();

  pathName = url.parse(request.url).pathname;
  query = url.parse(request.url).query;
  console.log('pathName: ' + pathName);
  console.log('query: ' + query);

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

// Start WebSocket Server.
const wss = new WebSocket.Server({
  port: wsPort
});
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    ws.send(message);
    var parsedMsg = JSON.parse(message);

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
          // Tell all of the players that the game is starting and send the first board object.
          var playersList = boardsList[freeBoard].getPlayers;
          for (var i = 0; i < playersList.length; i++) {
            playersList[i].connection.send({
              msgType: "gameStarting"
            });
            playersList[i].connection.send({
              msgType: "boardUpdate",
              board: boardsList[freeBoard].getAsJSON()
            });
          }
        } else {
          // Otherwise, just send a waiting message.
          ws.send({
            msgType: "waitingForPlayers"
          });
        }
        break;
      case "playerMove":
        // Do this.

        sendBoardUpdate(board);
        break;
      case "unlockBox":
        // Find the board that this player is on.
        var sessionID = parsedMsg.sessionID;
        var board = null;
        for (var i = 0; i < boardsList.length; i++) {
          var playersList = boardsList[i].getPlayers;
          for (var j = 0; j < playersList.length; j++) {
            if (playersList[j].sID === sessionID) board = boardsList[i];
          }
        }

        // IF no board was found, error out.
        if (board == null) {
          ws.send({
            msgType: "ERR",
            err: "Board not found"
          });
          return;
        }

        // Otherwise, enable the gosh darn box!
        board.enableBox(parsedMsg.x, parsedMsg.y);
        sendBoardUpdate(board);
        break;
      default:
        ws.send({
          msgType: "ERR",
          err: "Invalid message type"
        });
        break;
    }
  });
});