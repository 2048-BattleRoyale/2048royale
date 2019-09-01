const readline = require('readline');
const Board = require("../board.js");

var board = new Board();

console.log("Initial Setup:");
board.initBoard();
board.addPlayer(1234, null, "Bob");
board.addPlayer(1234, null, "Bob");
board.addPlayer(1234, null, "Bob");
board.addPlayer(1234, null, "Bob");
board.logBoardState();

function getInputAndAct() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Move direction? ', (answer) => {
    console.log(answer);
    board.handleBoardMove(answer, 1);
    board.logBoardState();

    rl.close();
    getInputAndAct();
  });
}

getInputAndAct();