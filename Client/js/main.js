/////////////////////
// Create the grid //
/////////////////////

var gridContainer = document.getElementById('gridlines');
gridContainer.style.transform = "translate(0vmin,0vmin)";

//Draw those snazzy vertical lines
for (index = 1; index < 14; index++) {
  var vertical_line = document.createElement('div');
  vertical_line.className = 'vline';
  vertical_line.id = "vline" + index.toString();
  gridContainer.appendChild(vertical_line);
  document.getElementById("vline" + index.toString()).style.transform = "translate(" + (5.75 * index).toString() + "vmin," + (0).toString() + "vmin)";
}

//Draw some snazzier horizontal lines
for (index = 1; index < 14; index++) {
  var horizontal_line = document.createElement('div');
  horizontal_line.className = 'hline';
  horizontal_line.id = "hline" + index.toString();
  gridContainer.appendChild(horizontal_line);
  document.getElementById("hline" + index.toString()).style.transform = "translate(" + (0).toString() + "vmin," + (5.75 * index).toString() + "vmin)";
}

/////////////////////////////////////
// Class and Variable Declarations //
/////////////////////////////////////

var grid = document.getElementById('tiles');
var score = 0;
var stringJSON; // Unparsed JSON
var playerAlive = true;
var players = []; //Total array of all players
var newBoard; //First draw
var animationSpeed = 150; //What speed should these tiles move at?
var gameStarted = false; //Are you a moron? Read the name.
var sessionID; //Certain Player's SessionID
var myPlayerNum = 4; //Where am I on the leaderboard?
var lockedBoxes = []; //Array of all lockedBoxes?
var lightColor = 'F9F6F2';
var darkColor = '776E65';
var transformationFactorX = 5.741924954411; // This is the value in which a tile must move to be centered on the X axis, with all of the pieces of the grid. The same is true of the 'y' value.
var transformationFactorY = 5.747124954411; // See above
var memDump; // Purely used for type conversion
var oldBoard = { // Second most recent board in memory
  "players": {},
  "boxes": {}
};
var recentBoard = { // Most recent board object
  "players": {},
  "boxes": {}
};
var debug = false; // Debug mode, y/n?
var canMove = true; // Can the player currently make a move?
var boxClicked = false; // Have you  clicked a box?
var boxesOpened = 2; // Starting at two, this value allows you to open boxes.
var logDump; // Dumps most recent JSON in Raw
var percentUntilNextMove={
  nextMove:"0%"
};


/////////////////////////////////////
//         Color Profiles          //
/////////////////////////////////////

var theme1 = {
  "2": "EEE4DA",
  "4": "ede0c8",
  "8": "F2B179",
  "16": "F59563",
  "32": "F67C5F",
  "64": "F65E3B",
  "128": "EDCF72",
  "256": "EDCC61",
  "512": "EDC850",
  "1024": "EDC53F",
  "2048": "EDC22E",
  "4096": "F4DA81",
  "8192": "FBF2D5",
  "16384": "9000FF"
}
var extraInfo = { //This is stored in the secondary colors Cookie
  "gridBackground": "CDC1B4",
  "lineBorder": "BBADA0",
  "blocked": "978F86",
  "darkColor": "776e65",
  "lightColor": "F9F6F2"
}

//Tile class is the object that's stored in each array.
class Tile { //A class used to re-parse Board JSON (somewhat legacy)
  constructor(id, x, y, value, owner, enabled) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.owner = owner;
    this.enabled = enabled;
  }
}

/////////////////////////////////////
//         Utility Functions       //
/////////////////////////////////////

//Find the CSS transformation factor of a given tile at any point.
function findCurrentAnim(id, xory) { // Useful in the console to find X or Y
  var transforms = document.getElementById('tile' + id.toString()).style.transform; //Get the overarching CSS transform
  transformY = ((transforms.split('translateY'))[1].slice(0, (transforms.split('translateY'))[1].length - 5)); //Use slices to break the Y transform down to just x + vmin
  transformY = transformY.slice(1, transformY.length - 5)
  transformX = ((transforms.split('translateY'))[1].split('translateX'))[0].slice(0, (transforms.split('translateY'))[1].split('translateX')[0].length - 5); //See above.
  transformX = transformX.slice(1, transformX.length - 5)
  if (xory == 'X') { //Want to find the X animation? This checks it. The same is true for the y.
    return transformX;
  }
  if (xory == 'Y') {
    return transformY;
  } else {
    console.log("Fatal error on line 106.");
  }
}

//This converts an ID value, ranging from (1-196)%14 into an X value.
function calcX(tileId) { //Used to parse the modulo values given in the Tile creation of newTile
  if (tileId == 1)
    return 1; //This basically turns the ID into an x value from 1-14.
  else if (tileId == 0)
    return 14;
  else
    return tileId;
}
function allowNextMove() {
  anime({
    targets: percentUntilNextMove, //Target the appropriate div
    nextMove: ['0%', '100%'],
    round:10,
    duration:150,
    easing: 'easeInOutCubic',
    update: function() {
      document.getElementById('nextMoveTimer').style='width:'+percentUntilNextMove.nextMove;

    },
    complete: function () {
      document.getElementById('nextMoveTimer').style='width:0%';
      //percentUntilNextMove.nextMove='0%';
      canMove=true;
    }
  })
}
//This converts an ID value, ranging from (1-196)%14 into a Y value.
function calcY(tileId) { //See above... but for Y
  if (tileId % 14 == 0)
    return tileId / 14;
  else
    return Math.floor(tileId / 14 + 1);
}

//This, although only one line, shortens the code greatly.
function getColor(values) { //Takes the color of a tile with a certain number and steals it from the cookie table
  return JSON.parse($.cookie("colorTheme"))[values.toString()];
}

//Should the text be the light color, or the dark color?
function darkOrLight(bgColor) { //Thanks https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
  //Figure out if the font color should be dark or light, given a hex value

  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 215) ?
    darkColor : lightColor;
}

//Take the JSON.parse'd string the server sends, and convert it into the format of the client, repurposing information for the scoreboard along the way
function jsonParser(jsonToParse) {
  //jsonToParse is the name of the overall JSON, duh, Neil.
  //Do something with the player values here
  logDump = jsonToParse;
  var parsedBoard = {
    "players": {},
    "boxes": {}
  };
  for (let i = 0; i < jsonToParse.players.length; i++) {
    //This customizes the widget on the side of the screen, and adds the current players to it.
    parsedBoard.players[i + 1] = jsonToParse.players[i];
    if (gameStarted == false) {
      players.push(jsonToParse.players[i].name);
      document.getElementById("player" + myPlayerNum).classList.add("indigo");
      document.getElementById("player" + myPlayerNum).classList.remove("elegant-color-dark");
    }
    score = jsonToParse.players[parseInt(myPlayerNum) - 1].score;

    document.getElementById("player" + (i + 1).toString()).innerHTML = jsonToParse.players[i].name + "   " + "<span class=\"badge badge-primary badge-pill elegant-color \" id=\"player1sc\">" + jsonToParse.players[i].score + "</span>";
  }

  //Parse locked Boxes
  lockedBoxes = [];
  for (let j = 0; j < jsonToParse.boxes.length; j++) {
    if (!jsonToParse.boxes[j].enabled)
      lockedBoxes.push(j + 1);
    if (jsonToParse.boxes[j].tileNum == 0) //Catch-all needs to be replaced soon
      continue;

    let testOb = jsonToParse.boxes[j];
    let tempID = testOb.tileId;
    testOb.tileId = j + 1; // Sets name to tile ID.
    parsedBoard.boxes[tempID.toString()] = testOb;
  }
  drawLocked();

  //Manage the scoreboard
  let currentObj = document.getElementById("openB");
  if (score >= (10 ** boxesOpened))
    currentObj.className = "btn btn-dark active newBox active"
  else
    currentObj.className = "btn btn-dark active newBox disabled"

  if (debug)
    console.log("set score to:" + score * 100 / (10 ** boxesOpened) + '%');

  document.getElementById("scoreBar").style = 'width:' + score * 100 / (10 ** boxesOpened) + '%';
  return parsedBoard;
}

//Cleanup divs and make everything align nicely.... A late-game function, for performance optimizations.
function divCleaner() {
  for (i = 0; i < eventuallyRemove.length; i++) {
    document.getElementById("tile" + eventuallyRemove[i]).remove();
    if (debug) {
      console.log("Removed tile" + eventuallyRemove[i]);
    }
  }
}

///////////////////////////////
//      Primary Functions    //
///////////////////////////////

//Redraws a given id with BOX data with no animation- hence, silent. See newTile, if you're confused, for further details.
function silentNew(id, Box) {
  //console.log('Attempting to move' + id);
  var box = new Tile(id, calcX(Box.tileId % 14), calcY(Box.tileId), Box.tileNum, Box.owner, Box.enabled);
  var tile_div = document.getElementById("tile" + id);
  tile_div.className = 'tile';
  tile_div.innerHTML = (box.value).toString() + "<div style=\"height:.5vmin;\"><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);height:.1vmin\">" + players[Box.owner - 1] + "</div></div>"; //Work around for terrible CSS practices.
  tile_div.id = 'tile' + (box.id).toString();
  document.getElementById('tile' + (box.id).toString()).style.transform = "translate(" + (transformationFactorX * (box.x - 1)) + "vmin," + ((box.y - 1) * transformationFactorY) + "vmin)"; //Original position transform
  document.getElementById('tile' + (box.id).toString()).style.backgroundColor = '#' + getColor(box.value);
  document.getElementById('tile' + (box.id).toString()).style.transform = document.getElementById('tile' + (box.id).toString()).style.transform + " translateX(0vmin)" + " translateY(0vmin)"; //Original position transform
  document.getElementById('tile' + (box.id).toString()).style.color = '#' + darkOrLight(getColor(box.value));

  switch (Box.tileNum) {
    case (2):
    case (4):
    case (8):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2.5vmin'; //5 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (16):
    case (32):
    case (64):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2.5vmin'; //4.6 Max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (128):
    case (256):
    case (512):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2vmin'; // 2.8 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (1024):
    case (2048):
    case (4096):
    case (8192):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2vmin'; // 2 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (16384):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '1.7vmin'; //1.5 optimal
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
  }
}

//Draws brand new Boxes
function newTile(id, Box) {
  var box = new Tile(id, calcX(Box.tileId % 14), calcY(Box.tileId), Box.tileNum, Box.owner, Box.enabled); // Turns the board box object into a compatible Tile object for easy access.
  var tile_div = document.createElement('div');
  tile_div.className = 'tile';
  tile_div.innerHTML = (box.value).toString() + "<div style=\"height:.5vmin;\"><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);height:.1vmin\">" + players[Box.owner - 1] + "</div></div>"; //Work around for terrible CSS practices.
  tile_div.id = 'tile' + (box.id).toString();
  grid.appendChild(tile_div); //Add this to the grid element.

  document.getElementById('tile' + (box.id).toString()).style.transform = "translate(" + (transformationFactorX * (box.x - 1)) + "vmin," + ((box.y - 1) * transformationFactorY) + "vmin)"; //Original position transform
  document.getElementById('tile' + (box.id).toString()).style.backgroundColor = '#' + getColor(box.value);
  document.getElementById('tile' + (box.id).toString()).style.transform = document.getElementById('tile' + (box.id).toString()).style.transform + " translateX(0vmin)" + " translateY(0vmin)"; //Original position transform
  anime({ //Animate it all.
    targets: '#' + 'tile' + (box.id).toString(),
    scale: [{
      value: [0, 1],
      duration: animationSpeed,
    }, ],
    rotation: [{
      value: ['20deg', '-20deg', '0deg'], //Legacy animation support- easy to turn on, by changing the property name.
      duration: animationSpeed,
    }, ],
    backgroundColor: [{
      value: ['#FFFFFF', '#' + getColor(box.value)], //Using the getColor function to access the stored cookie JSON
      duration: animationSpeed,
    }, ],

    easing: 'linear',
  })
  document.getElementById('tile' + (box.id).toString()).style.color = '#' + darkOrLight(getColor(box.value)); //Simply changes font color, in accordance with the dark or light function.

  switch (Box.tileNum) { //Allows for easy switching of max font size for each character length.... eventually a very important portion of the code.
    case (2):
    case (4):
    case (8):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2.5vmin'; //5 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (16):
    case (32):
    case (64):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2.5vmin'; //4.6 Max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (128):
    case (256):
    case (512):
      //    document.getElementById('tile'+(box.id).toString()).style.marginLeft='255vmin'
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2vmin'; // 2.8 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (1024):
    case (2048):
    case (4096):
    case (8192):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '2vmin'; // 2 max
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
    case (16384):
      document.getElementById('tile' + (box.id).toString()).style.fontSize = '1.7vmin'; //1.5 optimal
      document.getElementById('tile' + (box.id).toString()).style.lineHeight = '5vmin';
      break;
  }
}

// Draw all of the locked, sessile boxes.
function drawLocked() {
  $('.blocked').remove() //kill all of the current locked boxes.

  for (let i = 0; i < lockedBoxes.length; i++) { //For each locked box, redraw it, accommodating for blanks.
    var blocked_tile = document.createElement('div');
    blocked_tile.className = 'blocked';
    blocked_tile.id = 'blocked' + lockedBoxes[i];
    grid.appendChild(blocked_tile);
    var transformationFactorX = 5.741924954411;
    var transformationFactorY = 5.748124954411;
    document.getElementById('blocked' + (lockedBoxes[i]).toString()).style.transform = "translate(" + (transformationFactorX * (calcX(lockedBoxes[i] % 14) - 1)) + "vmin," + (calcY(lockedBoxes[i]) - 1) * transformationFactorY + "vmin)"; //Original position transform
    document.getElementById('blocked' + (lockedBoxes[i]).toString()).style.transform = document.getElementById('blocked' + (lockedBoxes[i]).toString()).style.transform + " translateX(0vmin)" + " translateY(0vmin)"; //Original position transform
  }

  $(".blocked").css("background-color", "#" + JSON.parse($.cookie("boardTheme"))["blocked"]); //Color it with the blocked box cookie.
}

//Tile is the tile as it sits NOW, FutureTile is where you want it to move.
function moveTile(id, Tile, FutureTile) {
  var progress = 0;

  //Animate the Tile from 'Tile' to 'FutureTile'
  anime({
    targets: '#' + 'tile' + id, //Target the appropriate div
    translateY: {

      value: [findCurrentAnim(id, "Y"), (((calcY(FutureTile.tileId)) - calcY(Tile.tileId)) * transformationFactorY).toString() + 'vmin'], // This might make very little sense, but it's due to the way CSS animations work. You need to find the current value  of it, and work from there, hence, the excessive code.
      duration: animationSpeed,
    },
    translateX: {
      value: [findCurrentAnim(id, "X"), (((((calcX(FutureTile.tileId) % 14)) - (calcX(Tile.tileId) % 14))) * transformationFactorX).toString() + 'vmin'], //See above       //value:[5.735*0,5.735*-13],
      duration: animationSpeed,
    },

    backgroundColor: [{
      value: ['#' + getColor(Tile.tileNum), '#' + getColor(FutureTile.tileNum)], //Animate colors for deletion+movement animations... not implemented yet, sadly, due to some arcane bug.
      duration: animationSpeed,
    }],

    easing: 'easeInOutCubic',
    update: function () { //Change the text in a tile mid move, if it's merging.
      progress += 1

      if (progress > 40 && progress < 50) {
        document.getElementById('tile' + (id).toString()).style.color = '#' + darkOrLight(getColor(FutureTile.tileNum));
        document.getElementById('tile' + (id).toString()).innerHTML = (FutureTile.tileNum).toString() + "<div style=\"height:.5vmin;\"><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);height:.1vmin\">" + players[FutureTile.owner - 1] + "</div></div>";
      }
    },
    complete: function () {
      silentNew(id, FutureTile); //Reset the CSS properties with a silent deletion
        }
  })
}

//Play delete animation then kick that sorry thing off of the array.
function deleteTile(id, Tile) {
  if (debug) {
    console.log("DELETING " + id);
  }
  anime({ //Animate deletions.
    targets: '#' + 'tile' + id,
    scale: [{
      value: 0,
      duration: animationSpeed,
    }, ],
    rotation: [{
      value: '1turn',
      duration: animationSpeed,
    }, ],
    backgroundColor: [{
      value: ['#' + getColor(Tile.tileNum), '#FFFFFF'],
      duration: animationSpeed,
    }, ],

    easing: 'linear',
    complete: function () {
      //eventuallyRemove.push((id).toString()); //Add it to the eventually remove array.
      document.getElementById('tile' + id).remove(); //Actually remove the div.
    }
  })
}

//Draw all movement using the most recent array as source, and an input one from the JSON parser.
function drawMovement(newBoard) {
  board = newBoard;
  memDump = JSON.parse(JSON.stringify(newBoard)); //This is the way garbage languages like JS require you to obfuscate a memory location.
  //Find Key Differences
  newArrayKeys = (Object.keys(newBoard.boxes)); //Find the keys, or ids, of each box in both arrays.
  newArrayKeys = newArrayKeys.map(function (x) {
    return parseInt(x, 10);
  });
  currentArrayKeys = Object.keys(oldBoard.boxes);
  currentArrayKeys = currentArrayKeys.map(function (x) {
    return parseInt(x, 10);
  });

  if (debug) {
    console.log("THE NEW BOARD IS: " + newArrayKeys)
    console.log("THE OLD BOARD IS: " + currentArrayKeys);
  }
  //First, you find if there are any elements newArrayKeys has that the current one doesn't (additions)

  additions = []
  additions = newArrayKeys.filter(x => !currentArrayKeys.includes(x));
  if (debug)
    console.log("Done adding " + additions);

  //Then, you check to see if there are any elements (by id) that the old array has and new doesn't  (deletions)
  deletions = []
  if (debug) {
    console.log("The board will contain " + newArrayKeys);
    console.log("The board currently contains" + currentArrayKeys);
  }
  deletions = currentArrayKeys.filter(x => !newArrayKeys.includes(x));
  if (debug)
    console.log("Done deleting " + deletions);

  //Remove these from the lists; they'll be parsed separately
  //Parse Deletions
  do {
    if (additions.length > 0) {
      newTile(additions[0], newBoard.boxes[additions[0]]);
      delete newBoard.boxes[additions[0]];
      delete currentArrayKeys[additions[0]];
      additions.shift();
    }
  } while (additions.length > 0);
  ketamine = currentArrayKeys.filter(x => newArrayKeys.includes(x)); //Don't ask about the variable name.... this one was painful. These filters ultimately look for intersections in both arrays. Simple.
  if (debug)
    console.log('Things to just move:' + ketamine);

  var i = 0;
  for (i in ketamine) {
    if (debug) {
      console.log("RECIEVED" + i);
      console.log(ketamine[i] + 'SENT');
    }
    moveTile(ketamine[i], oldBoard.boxes[ketamine[i]], newBoard.boxes[ketamine[i]]);
  }
  do {
    if (deletions.length > 0) {
      deleteTile(deletions[0], oldBoard.boxes[deletions[0]]);
      deletions.shift();
    }
  } while (deletions.length > 0);

  if (debug)
    console.log("THE OLD BOARD WAS" + Object.keys(oldBoard.boxes));

  oldBoard = memDump;
  if (debug)
    console.log("THE OLD BOARD IS" + Object.keys(oldBoard.boxes));
}

///////////////////////
//     Listeners     //
///////////////////////

// Read key presses
document.addEventListener('keyup', function (event) {
  //alert(event.keyCode); (Uncomment this line if you need to add future key switch codes)
  if (gameStarted && canMove) {
    switch (event.keyCode) {
      case 87:
      case 38:
        socket.send(JSON.stringify({
          msgType: "playerMove",
          direction: "up",
          sessionID: JSON.parse($.cookie("sessionID")).toString()
        }));
        canMove = false;
        if (debug) {
          console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "up",
              sessionID: JSON.parse($.cookie("sessionID")).toString()
            }));
        }
        allowNextMove();

        break;
      case 39:
      case 68:
        socket.send(JSON.stringify({
          msgType: "playerMove",
          direction: "right",
          sessionID: JSON.parse($.cookie("sessionID")).toString()
        }));
        canMove = false;

        if (debug) {
          console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "right",
              sessionID: JSON.parse($.cookie("sessionID")).toString()
            }));
        }
        allowNextMove();

        break;
      case 40:
      case 83:
        socket.send(JSON.stringify({
          msgType: "playerMove",
          direction: "down",
          sessionID: JSON.parse($.cookie("sessionID")).toString()
        }));
        canMove = false;

        if (debug) {
          console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "down",
              sessionID: JSON.parse($.cookie("sessionID")).toString()
            }));
        }
        allowNextMove();

        break;
      case 37:
      case 65:
        socket.send(JSON.stringify({
          msgType: "playerMove",
          direction: "left",
          sessionID: JSON.parse($.cookie("sessionID")).toString()
        }));
        canMove = false;

        if (debug) {
          console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "left",
              sessionID: JSON.parse($.cookie("sessionID")).toString()
            }));
        }
        allowNextMove();

        break;
    }
  }
});

// Prevent scrolling
window.addEventListener("keydown", function (e) {
  // space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1)
    e.preventDefault();
}, false);


//Ensure that sockets work when the site first loads
window.onload = function () {
  //Random Jquery Stuff to keep site running

  //Clicking on the title? Go home.
  $('#title').on('click', function () {
    window.location.href = "index.html";
    console.log('home');
  });

  //If you click the newBox button, and you're in a position where you could open a newBox, enable the next box clicked.
  $('.newBox').on('click', function () {
    if (score >= (10 ** boxesOpened)) {
      $(".blocked").css({
        "border-color": "#FFFFF",
        "border-width": "1px",
        "border-style": "solid"
      });
      boxClicked = true;
    }
  });

  //Enable the next box clicked, and send it to the server
  $(document).on('click', '.blocked', function () {
    var id = $(this).attr('id').split("blocked")[1];
    if (debug) {
      console.log(id);
    }
    let xValue = calcX(id % 14) - 1;
    let yValue = calcY(id) - 1;
    if (debug)
      console.log(xValue + "," + yValue);

    if (boxClicked) {
      socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
        msgType: "unlockBox",
        sessionID: sessionID.toString(),
        'row': yValue.toString(),
        'col': xValue.toString(),
      }));
      boxClicked = false;
      delete document.getElementById('blocked' + id);
      boxesOpened++;
    }
  });

  ///////////////////////
  //      Cookies      //
  ///////////////////////

  //Is this the first time the page is opened, and the cookie(s) don't exist? Add the defaults.

  if (document.cookie.indexOf('colorTheme') == -1)
    $.cookie("colorTheme", JSON.stringify(theme1));

  if (document.cookie.indexOf('boardTheme') == -1)
    $.cookie("boardTheme", JSON.stringify(extraInfo));

  //Set the theme, for background elements
  $(".vline, .hline").css("background-color", "#" + JSON.parse($.cookie("boardTheme"))["lineBorder"]);
  $(".grid").css("border", "2vmin solid #" + JSON.parse($.cookie("boardTheme"))["lineBorder"]);
  $(".grid").css("background-color", "#" + JSON.parse($.cookie("boardTheme"))["gridBackground"]);
  darkColor = JSON.parse($.cookie("boardTheme"))["darkColor"];
  lightColor = JSON.parse($.cookie("boardTheme"))["lightColor"];

  // Create a new WebSocket.
  socket = new WebSocket('wss://tfrserver.herokuapp.com');

  // Handle any errors that occur.
  socket.onerror = function (error) {
    console.log('WebSocket Error: ' + error);
  };

  // Show a connected message when the WebSocket is opened.
  socket.onopen = function () {
    console.log("Socket is connected.");

    socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
      msgType: "signup",
      name: "Player" + Math.floor(Math.random() * 10)
    }));
  };

  // Handle messages sent by the server.
  socket.onmessage = function (event) {
    if (debug)
      console.log(event.data);

    stringJSON = event.data;
    data = JSON.parse(event.data);
    if (debug)
      console.log(data.msgType)

    switch (data.msgType) {
      case 'boardUpdate': //Is the board being updated?
        parsedBoard = jsonParser(data.board);
        $.cookie("lastBoard", JSON.stringify(parsedBoard)); //Also log currentArray, somehow, in order to redraw smooothly.
        drawMovement(parsedBoard);
        gameStarted = true;
        recentBoard = jsonParser(data.board);

        break;
      case 'waitingForPlayers': //Are we waiting for players? If so, update the notification
        if (!$("#waiting").length) {
          var alert = document.createElement('div');
          alert.className = 'alert alert-dismissible alert-dark fade show';
          alert.id = 'waiting';
          alert.role = "alert";
          alert.innerHTML = "Welcome to the queue. We are currently waiting on " + data.numLeft + " players. Thank you for your patience.";
          document.getElementById("alertCenter").appendChild(alert);
        } else {
          document.getElementById("waiting").innerHTML = "Welcome to the queue. We are currently waiting on " + data.numLeft + " players. Thank you for your patience.";
        }

        if (data.numLeft == 0)
          $('#waiting').alert('close');

        $('#waiting').on('click', function () {
          $('#waiting').alert('close');
        })
        break;
      case 'gameStarting': //Is the game starting? Close alerts, and fetch your playerID.
        if (debug)
          console.log(data);

        gameStarted = false;

        if (!$("#waiting").length)
          $('#waiting').alert('close');

        myPlayerNum = parseInt(data.playerId) + 1;
        console.log("PlayerID:" + myPlayerNum);
        if (gameStarted == false) {
          document.getElementById("player" + myPlayerNum).classList.add("indigo");
          document.getElementById("player" + myPlayerNum).classList.remove("elegant-color-dark");
        }
        /* Uncomment this when you want cookie persistence
           socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
           msgType: "signup",
           sessionID: sessionID.toString(),
           name: "Billy Bob"
         }));
         */
        break;
      case 'ERR':
        console.log(data);
        console.log("FATAL ERROR IN WEBSOCKET- COLLECTING LOG");
        break;
      case 'signupSuccess':
        console.log(data.sessionId);
        $.cookie("sessionID", JSON.stringify(data.sessionId));
        sessionID = data.sessionId;
        break;
      case 'heartbeat': //Keep connection Live
        break;
      case 'gameOver':
        break;

      case 'gameTimeOut':
        alert("There is a 20 minute game limit. You've been kicked");
        location.reload();
        $.cookie("sessionID", null);
        break;
      case 'clientClosed':
        break;
        //Delete Cookies
    };

    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function () {
      console.log("Socket has been disconnected");
    };
  };
}