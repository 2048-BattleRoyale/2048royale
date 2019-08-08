const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const Board = require("./board.js");

const httpPort = 7000;
const wsPort = 8000;
console.log("CONFIG: http on port:\t" + httpPort);
console.log("CONFIG: ws on port:\t" + wsPort);

// {Board, Board, Board, ...}
var boardsList = [];

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
  for (var i = 0; i < board.getPlayers.length; i++) {
    board.getPlayers[i].connection.send(JSON.stringify({
      msgType: "boardUpdate",
      board: board.getAsJSON()
    }));
  }
}

// Handles an incoming WebSockets message.
function handleWsMessage(ws, msg) {
  // console.log('received: %s', msg);
  ws.send(msg);
  var parsedMsg = JSON.parse(msg);
  console.log(parsedMsg);

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
        var playersList = boardsList[freeBoard].getPlayers();
        console.log("Players list:")
        console.log(playersList)
        for (var i = 0; i < playersList.length; i++) {
          console.log("Sending game stating message to board: " + freeBoard + ", player: " + i)
          playersList[i].connection.send(JSON.stringify({
            msgType: "gameStarting"
          }));
          playersList[i].connection.send(JSON.stringify({
            msgType: "boardUpdate",
            board: boardsList[freeBoard].getAsJSON()
          }));
        }
      } else {
        // Otherwise, just send a waiting message.
        console.log("Nope, just sending waiting message.")
        ws.send(JSON.stringify({
          msgType: "waitingForPlayers"
        }));
      }
      break;
    case "playerMove":
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
        ws.send(JSON.stringify({
          msgType: "ERR",
          err: "Board not found"
        }));
        return;
      }

      // Otherwise, handle the gosh darn box!
      board.handleBoardMove(parsedMsg.direction);
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
        ws.send(JSON.stringify({
          msgType: "ERR",
          err: "Board not found"
        }));
        return;
      }

      // Otherwise, enable the gosh darn box!
      board.enableBox(parsedMsg.x, parsedMsg.y);
      sendBoardUpdate(board);
      break;
    default:
      ws.send(JSON.stringify({
        msgType: "ERR",
        err: "Invalid message type"
      }));
      break;
  }
}

// Start HTTP Server to listen for new clients to sign in.
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

// Start WebSocket Server to listen for new players making moves/actions.
const wsserver = new WebSocket.Server({
  port: wsPort
});
wsserver.on('connection', function connection(websocket) {
  websocket.on('message', function incoming(msg) {
    handleWsMessage(websocket, msg);
  });
});