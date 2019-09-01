const websockets = require('ws');
const Board = require("./board.js");

const printDebugLevelMsgs = true;
const httpPort = 7000;
const wsPort = process.env.PORT || 8000;
const oldBoardTimeout = 20 /* mins */ * 60 /* secs */ * 1000 /* ms */ ;
const timeBetweenOldBoardCleanupPasses = 1 /* mins */ * 60 /* secs */ * 1000 /* ms */ ;
const timeBetweenHeartbeatMsgs = 1 /* mins */ * 60 /* secs */ * 1000 /* ms */ ;

// Log config messages to the terminal.
console.log("CONFIG: HTTP server on port:\t" + httpPort);
console.log("CONFIG: WS server on port:\t" + wsPort);
console.log("CONFIG: Time formatted in MM/DD/YYYY HH:MM::SS:MS, local server time zone");
console.log("CONFIG: Server Timezone:\tUTC" + (-(new Date).getTimezoneOffset() / 60));
console.log();
console.log("BEGIN SERVER LOG OUTPUT");

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
  var date = new Date(Date.now());
  var stringDate = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() +
    " " + date.getHours() + ":" + date.getMinutes() + ":" +
    date.getSeconds() + ":" + date.getMilliseconds();

  if (critical) {
    console.log(stringDate + " -> CRITICAL ERR: " + msg);
  } else if (printDebugLevelMsgs) {
    console.log(stringDate + " -> DEBUG: " + msg);
  }
}

// List of issued session IDs which will be accepted by the WebSockets API.
var issuedSIDs = [];

// Creates a random string of characters length characters long.
function makeSessionID(length) {
  logMsg(false, "Session ID of length " + length + " created");

  // Make new session IDs until we find one that isn't already in use.
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var newSessionID;
  var viable = true;
  do {
    newSessionID = "";
    for (var i = 0; i < length; i++)
      newSessionID += characters.charAt(Math.floor(Math.random() * characters.length));

    // Is the generated sessionID in use?
    for (var i = 0; i < issuedSIDs.length; i++)
      if (newSessionID === issuedSIDs[i]) viable = false;
  } while (!viable)

  // Push the new session ID onto the list of issued IDs.
  issuedSIDs.push(newSessionID);

  return newSessionID;
}

// Send board update to all players in the board.
function sendBoardUpdate(board) {
  logMsg(false, "Sending board object updates to all players");
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

// Helper function called on a cycle timer which removes old and unused boards
// from the list.
function cleanUpOldBoards() {
  logMsg(false, "Cleaning up old boards.");
  var numBoardsRemoved = 0;

  for (var i = 0; i < boardsList.length; i++) {
    var creationTime = boardsList[i].getWhenGameBegan().getTime();

    // If the board hasn't started yet, then don't delete it, you buffoon!
    if (creationTime == 0) continue;

    // If the board has been around longer than it's allowed to, clean it up.
    if ((new Date()).getTime() - creationTime > oldBoardTimeout) {
      // Send the cleanup message to all players.
      for (var j = 0; j < boardsList[i].getPlayers().length; j++) {
        logMsg(false, "Sending board cleanup to sessionID: " + boardsList[i].getPlayers()[j].sID)
        boardsList[i].getPlayers()[j].connection.send(JSON.stringify({
          msgType: "gameTimeout",
        }));
      }

      // Remove the board from the list.
      boardsList.remove(i);
      numBoardsRemoved++;
    }
  }

  if (numBoardsRemoved > 0) logMsg(false, "Cleanup routine removed " +
    numBoardsRemoved + " empty/unused boards");
  else logMsg(false, "Cleanup routine removed no boards");
}

// Helper function called on a cycle timer to keep the websocket connection alive.
function sendHeartbeatMsgs() {
  for (var i = 0; i < boardsList.length; i++) {
    var playersList = boardsList[i].getPlayers();
    for (var j = 0; j < playersList.length; j++) {
      playersList[j].connection.send(JSON.stringify({
        msgType: "heartbeat"
      }));
    }
  }
}

// Handles an incoming WebSockets message.
// ws (websocket connection): WebSocket to use for communication with the current client.
// msg (JSON string): Non-parsed JSON string with the message body.
function handleWsMessage(ws, msg) {
  // Try to parse the JSON, catching possible exceptions.
  var parsedMsg;
  try {
    parsedMsg = JSON.parse(msg);
  } catch (SyntaxError) {
    logMsg(false, "ERROR!: Malformed JSON message received.");
    ws.send(JSON.stringify({
      msgType: "ERR",
      err: "Malformed JSON"
    }));
    return;
  }

  // Is the provided session ID in the list of issued IDs?
  if (parsedMsg.msgType !== "signup") {
    var validSID = false;
    for (var i = 0; i < issuedSIDs.length; i++) {
      logMsg(false, "issuedID:\t" + issuedSIDs[i])
      logMsg(false, "parsedMsg.sID:\t" + parsedMsg.sessionID)
      if (parsedMsg.sessionID === issuedSIDs[i]) {
        logMsg(false, "Same.")
        validSID = true;
        break;
      }
    }
    if (!validSID) {
      logMsg(true, "ERR!: Session ID " + parsedMsg.sessionID + " is invalid!");
      ws.send(JSON.stringify({
        msgType: "ERR",
        err: "SessionID isn't valid"
      }));
      return;
    }
  }

  switch (parsedMsg.msgType) {
    case "signup":
      logMsg(false, "Signup message received. Name: " + parsedMsg.name);

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
      var newSessionID = makeSessionID(8);
      boardsList[freeBoard].addPlayer(newSessionID, ws, parsedMsg.name);

      logMsg(false, "New player added to board " + freeBoard + " sID " +
        newSessionID);

      // Send the client its new session ID.
      ws.send(JSON.stringify({
        msgType: "signupSuccess",
        sessionId: newSessionID
      }));

      // If this made the board full, then start the game.
      if (boardsList[freeBoard].isFull()) {
        // Initialize the board, so that it has boxes.
        boardsList[freeBoard].initBoard();

        // Tell all players that the game is starting and send the first board object.
        var playersList = boardsList[freeBoard].getPlayers();
        for (var i = 0; i < playersList.length; i++) {
          logMsg(false, "Sending game starting message to board: " + freeBoard + ", player: " + i)
          playersList[i].connection.send(JSON.stringify({
            msgType: "gameStarting",
            playerId: i
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
      logMsg(false, "Client closed message received. sID: " + parsedMsg.sessionID);
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
      logMsg(false, "Player move message received. sID: " + parsedMsg.sessionID +
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
      logMsg(false, "Box unlock message received. sID: " + parsedMsg.sessionID +
        ", row: " + parsedMsg.row + ", col: " + parsedMsg.col);
      // Find the board that this player is on.
      var sessionID = parsedMsg.sessionID;
      var board = findPlayersBoard(ws, sessionID);
      // If the player's board was found, enable the gosh darn box!
      if (board == null) {
        logMsg(true, "Error!: Board not found for sessionID: " +
          parsedMsg.sessionID)
      } else {
        board.enableBox(parsedMsg.row, parsedMsg.col);
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
// WebSockets Server init and setup.
// *****************************************************************************

// Setup periodic cleanup of old boards.
// https://stackoverflow.com/a/1224485/3339274
var cleanupHandle = setInterval(cleanUpOldBoards, timeBetweenOldBoardCleanupPasses);
//clearInterval(cleanupHandle)

// Setup periodic heartbeat message to all players.
var heartbeatHandle = setInterval(sendHeartbeatMsgs, timeBetweenHeartbeatMsgs);
//clearInterval(heartbeatHandle)

// Start WebSocket Server to listen for new players making moves/actions.
new websockets.Server({
  port: wsPort
}).on('connection', function (socket) {
  logMsg(false, "Connection established with new client");
  socket.on('message', function incoming(msg) {
    logMsg(false, "WebSocket message received: " + msg);
    handleWsMessage(socket, msg);
  });
});