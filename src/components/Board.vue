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

var serverURL = "http://spazzlo.com:8080";
var canvas;
var subdivision;
var ctx;
var colors = {
  "2": "F2F5C9",
  "4": "3097A4",
  "8": "3281A1",
  "16": "2D80B7",
  "32": "30CDAC",
  "64": "F2F5C9",
  "128": "3097A4",
  "256": "3281A1",
  "512": "2D3BB7",
  "1024": "30CDAC",
  "2048": "F2F5C9",
  "4096": "3097A4",
  "8192": "3281A1",
  "16384": "642DB7"
};
var grid = [];

//Push random multiples of 2
for (var i = 1; i <= 16 * 16 + 1; i += 1) {
  //grid.push({owner:"0",number:(2**(Math.floor(Math.random()*12)))})
  var random = Math.floor(Math.random() * 12);
  var multtwo = 2 ** random;
  grid.push(multtwo);
}

//Return the appropriate image for drawing
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

function drawImage(x, y, hex) {
  ctx.fillStyle = hex;
  if (hex == "0") {
    ctx.fillStyle = "#ffffff00";
  }
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

//Remove all of the heck in the canvas
function clearCanvas() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

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

function drawText(number, x, y) {
  // console.log(number.toString().length);
  if (number.toString().length == 1) {
    ctx.font = " 27px arial ";
    var c = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillText(number, x - subdivision * 0.1, y + 2);
    ctx.fillStyle = c;
  }
  if (number.toString().length == 2) {
    ctx.font = " 26px arial ";
    var c = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillText(number, x - subdivision * 0.2, y + 2);
    ctx.fillStyle = c;
  }
  if (number.toString().length == 3) {
    ctx.font = " 25px arial";
    var c = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillText(number, x - subdivision * 0.3, y + subdivision * 0.05);
    ctx.fillStyle = c;
  }
  if (number.toString().length == 4) {
    ctx.font = " 23px arial";
    var c = ctx.fillStyle;
    ctx.fillStyle = "black";
    ctx.fillText(number, x - subdivision * 0.4, y + 2);
    ctx.fillStyle = c;
  }
}

//Draw the entire grid
function reDraw() {
  drawGrid();
  var localx = 0;
  var localy = 0;
  var offset = -1;
  for (var i = 0; i <= 16 * 16; i++) {
    // console.log(hexJson(grid[localx + 16 * localy]));
    var hexval = "#" + hexJson(grid[localx + 16 * localy]);
    if (grid[localx + 16 * localy] == 0) {
      hexval = "0";
    }
    drawImage(localx, localy, hexval);
    drawText(grid[localx+16*localy],subdivision*localx+13,subdivision*localy+20); //Sparkling lime is sparkling lie
    localx += 1;
    if (localx % 2 == 0) {
      offset += 1;
    }
    //		drawImage(0,0,2);
    //		drawImage(2,2,16);
    if (i % 16 == 0 && i != 0) {
      localy += 1;
      localx = 0;
      offset = 1;
    }
  }
}

// Only draw stuff once the window is loaded and initialized
window.addEventListener("load", function(event) {
  canvas = document.getElementById("game-board");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerWidth * 0.5;

  subdivision = canvas.width / 16;
  ctx = canvas.getContext("2d");
  reDraw();

  window.onload = window.onresize = function() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerWidth * 0.8;
    subdivision = canvas.width / 16;
    reDraw();
  };

  // Log in
  // Get games list
  // $.ajax({
  //     url: "http://spazzlo.com:8080/games",
  //     data: {},
  //     dataType: "json",
  //     method: "GET"
  // }).done((gamelist) => {
  //     console.log(gamelist["games"][0][0])
  //     // Log into game
  //     $.ajax({
  //         url: "http://spazzlo.com:8080/join",
  //         data: {gameid: gamelist["games"][0][0]},
  //         dataType: "json",
  //         method: "GET"
  //     }).done((token) => {
  //         console.log(token)
  //         $.ajax({
  //           url: "http://spazzlo.com:8080/games",
  //           data: {},
  //           dataType: "json",
  //           method: "GET"
  //         }).done((data) => {
  //             console.log(data)
  //         })
  //     })
  // })
});

// Respond to move commands
document.addEventListener("keydown", function(event) {
  if (event.keyCode == 39) {
    console.log("Right");
    event.preventDefault();
  } else if (event.keyCode == 37) {
    console.log("Left");
    event.preventDefault();
  } else if (event.keyCode == 38) {
    console.log("Up");
    event.preventDefault();
  } else if (event.keyCode == 40) {
    console.log("Down");
    event.preventDefault();
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
