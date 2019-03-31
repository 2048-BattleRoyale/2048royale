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

function drawGrid() {
  var canvas = document.getElementById("game-board");
  var subdivision = canvas.width / 16;
  var ctx = canvas.getContext("2d");
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

function getAndParseJSON(url, parameters) {
  var Httpreq = new XMLHttpRequest();
  Httpreq.open("GET", url, false);
  Httpreq.setRequestHeader("Access-Control-Allow-Origin", "true");
  Httpreq.send(parameters);
  return JSON.parse(Httpreq.responseText);
}

// Only draw stuff once the window is loaded and initialized
window.addEventListener("load", function(event) {
  drawGrid();
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
