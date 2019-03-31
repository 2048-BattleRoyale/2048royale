<template>
  <div class="board">
    <canvas id="game-board" class="game-board" width="700px" height="700px"></canvas>
  </div>
</template>

<script>
export default {
  name: "Board",
  props: {}
};

// Global variables
var serverURL = "http://spazzlo.com:8080";
var canvas;
var subdivision;
var ctx;
var colors = require("./../assets/blockColors.json");
// var colors = {
//   // TODO: Import this from JSON file
//   "2": "ffcdd2",
//   "4": "f48fb1",
//   "8": "ba68c8",
//   "16": "7e57c2",
//   "32": "3f51b5",
//   "64": "1e88e5",
//   "128": "0288d1",
//   "256": "00838f",
//   "512": "004d40",
//   "1024": "b9f6ca",
//   "2048": "b2ff59",
//   "4096": "c6ff00",
//   "8192": "ffd600",
//   "16384": "212121"
// };
var grid = [];
var gameid;
var token;

// Draw a rectangle with rounded corners
function roundRect(x, y, width, height, radius, fill, stroke) {
  //still need to implement text, because I suck.
  if (typeof stroke == "undefined") {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

// Draw a block at the given coordintes
function drawBlock(x, y, hex) {
  if (hex == "0") ctx.fillStyle = "#ffffff00";
  else ctx.fillStyle = hex;

  roundRect(
    subdivision * x,
    subdivision * y,
    subdivision,
    subdivision,
    10,
    "#fff",
    "1px"
  );
}

// Remove all of the heck in the canvas
function clearCanvas() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

// Match a 2**x value to a hex color
function hexJson(number1) {
  var rando = "0";
  if (number1 != "0") {
    rando = number1.toString();
  } else {
    return "#ffffff00";
  }
  if (number1 == "0") {
    return "FFFF";
  }
  return colors[rando];
}

// Draw the gridlines and background canvas
function drawGrid() {
  ctx.strokeStyle = "#9c9c9c";

  {
    // Draw in white areas for each player
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      subdivision * 2,
      subdivision * 2,
      subdivision * 4,
      subdivision * 4
    );
    ctx.fillRect(
      subdivision * 2,
      subdivision * 10,
      subdivision * 4,
      subdivision * 4
    );
    ctx.fillRect(
      subdivision * 10,
      subdivision * 2,
      subdivision * 4,
      subdivision * 4
    );
    ctx.fillRect(
      subdivision * 10,
      subdivision * 10,
      subdivision * 4,
      subdivision * 4
    );
  }

  // Draw subdivision lines
  if (canvas.getContext) {
    ctx.lineWidth = 2;
    for (var i = subdivision; i < subdivision * 16; i += subdivision) {
      // Horiontal lines
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      // Vertical lines
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.width);
    }
    ctx.stroke();
  }
}

// Write in the numbers
function drawText(number, x, y) {
  var c = ctx.fillStyle;
  ctx.fillStyle = "black";

  if (number.toString().length == 1) {
    ctx.font = " 2.3vw arial ";
    ctx.fillText(number, x - subdivision * 0.15, y + 7);
  } else if (number.toString().length == 2) {
    ctx.font = " 1.8vw arial ";
    ctx.fillText(number, x - subdivision * 0.35, y + 4);
  } else if (number.toString().length == 3) {
    ctx.font = " 1.25vw arial";
    ctx.fillText(number, x - subdivision * 0.34, y + subdivision * 0.05);
  } else if (number.toString().length == 4) {
    ctx.font = " 1vw arial";
    ctx.fillText(number, x - subdivision * 0.4, y + 2);
  }

  ctx.fillStyle = c;
}

// Draw the entire grid
function reDraw() {
  // Reset grid[] object with updated values from server
  $.ajax({
    url: "http://spazzlo.com:8080/board",
    data: { token: token, gameid: gameid },
    dataType: "json",
    method: "GET"
  }).done(boarddata => {
    console.log(boarddata);
    for (var i = 0; i < 16; i++) {
      for (var o = 0; o < 16; o++) {
        grid[i * 16 + o] = boarddata["board"][i][o]["value"];
      }
    }
  });

  // Draw the grid, then draw in the blocks
  drawGrid();
  var localx = 0;
  var localy = 0;
  var offset = -1;
  for (var i = 0; i <= 16 * 16; i++) {
    var hexval = "#" + hexJson(grid[localx + 16 * localy]);
    if (grid[localx + 16 * localy] == 0) hexval = "0";

    drawBlock(localx, localy, hexval);
    drawText(
      grid[localx + 16 * localy],
      subdivision * localx + 13,
      subdivision * localy + 20
    ); //Sparkling lime is sparkling lie
    localx += 1;

    if (localx % 2 == 0) offset += 1;
    if (i % 16 == 0 && i != 0) {
      localy += 1;
      localx = 0;
      offset = 1;
    }
  }
}

// Log in
// Get games list
$.ajax({
  url: "http://spazzlo.com:8080/games",
  data: {},
  dataType: "json",
  method: "GET"
}).done(gamelist => {
  // Choose a game to log into and store the game id
  // TODO: select a game with < 4 players
  console.log(gamelist["games"][0][0]);
  gameid = gamelist["games"][0][0];

  // Log into game
  $.ajax({
    url: "http://spazzlo.com:8080/join",
    data: { gameid: gamelist["games"][0][0] },
    dataType: "json",
    method: "GET"
  }).done(tkn => {
    // Store the session token
    console.log(tkn);
    token = tkn["token"];

    // Only draw stuff once the window is loaded and initialized
    window.onload = window.onresize = function() {
      // Init global variables
      canvas = document.getElementById("game-board");
      canvas.width = window.innerWidth * 0.5;
      canvas.height = window.innerWidth * 0.5;
      ctx = canvas.getContext("2d");
      subdivision = canvas.width / 16;

      reDraw();
    };
  });
});

// Respond to move commands
// TODO: Debug this
document.addEventListener("keydown", function(event) {
  if (event.keyCode == 39) {
    // Right
    console.log("Right");
    event.preventDefault();
    $.ajax({
      url: "http://spazzlo.com:8080/makemove",
      data: { token: token, gameid: gameid, direction: 1 },
      dataType: "json",
      method: "GET"
    }).done(data => {
      console.log(data);
    });
    reDraw();
  } else if (event.keyCode == 37) {
    // Left
    console.log("Left");
    event.preventDefault();
    $.ajax({
      url: "http://spazzlo.com:8080/makemove",
      data: { token: token, gameid: gameid, direction: 3 },
      dataType: "json",
      method: "GET"
    }).done(data => {
      console.log(data);
    });
    reDraw();
  } else if (event.keyCode == 38) {
    // Up
    console.log("Up");
    event.preventDefault();
    $.ajax({
      url: "http://spazzlo.com:8080/makemove",
      data: { token: token, gameid: gameid, direction: 0 },
      dataType: "json",
      method: "GET"
    }).done(data => {
      console.log(data);
    });
    reDraw();
  } else if (event.keyCode == 40) {
    // Down
    console.log("Down");
    event.preventDefault();
    $.ajax({
      url: "http://spazzlo.com:8080/makemove",
      data: { token: token, gameid: gameid, direction: 2 },
      dataType: "json",
      method: "GET"
    }).done(data => {
      console.log(data);
    });
    reDraw();
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.game-board {
  border: 4px solid #8d8a8a;
  border-radius: 10px;
}
</style>
