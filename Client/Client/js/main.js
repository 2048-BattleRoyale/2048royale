var gridContainer=document.getElementById('gridlines');
gridContainer.style.transform="translate(0vmin,0vmin)";
//document.getElementById('background').style.transform="translate(1vmin,0vmin)"
//Draw those snazzy vertical lines
for (index = 1; index < 14; index++) {
  var vertical_line = document.createElement('div');
  vertical_line.className='vline';
  vertical_line.id="vline"+index.toString();
  gridContainer.appendChild(vertical_line);  
  document.getElementById("vline"+index.toString()).style.transform = "translate("+( 5.75*index).toString()+"vmin,"+(0).toString()+"vmin)";
}
//Draw some snazzier horizontal lines
for (index = 1; index < 14; index++) {
  var horizontal_line = document.createElement('div');
  horizontal_line.className='hline';
  horizontal_line.id="hline"+index.toString();
  gridContainer.appendChild(horizontal_line);  
  document.getElementById("hline"+index.toString()).style.transform = "translate("+(0).toString()+"vmin,"+(5.75*index).toString()+"vmin)";
}
//Variable&Class Declarations
var  grid= document.getElementById('tiles');
var userToken = "PLACEHOLDER";
var score = 0;
var totalB=0;
var animationDuration=500;
var packetSent = false;
var playerAlive = true;
var players=[];
var eventuallyRemove=[];
var newBoard;
var gameStarted=false;
var sessionID;
var myPlayerNum=4;
var lockedBoxes=[];
var lightColor='F9F6F2';
var darkColor='776E65';
var transformnumx=5.741924954411;
var oldnew;
var oldBoard={"players":{},"boxes":{}};
var transformnumy=5.747124954411;
var debug=false;
var recentboard={"players":{},"boxes":{}};
var okayWork=true;
var socket = new WebSocket('wss://tfrserver.herokuapp.com'); 
var boxClicked=false;
//Test/Example board used for testing out a real board object.
//Color Profiles Stored Dynamically Online- this is the default
var theme1={ //This is the standard 2048 theme
    "2":"EEE4DA",
    "4":"ede0c8",
    "8":"F2B179",
    "16":"F59563",
    "32":"F67C5F",
    "64":"F65E3B",
    "128":"EDCF72",
    "256":"EDCC61",
    "512":"EDC850",
    "1024":"EDC53F",
    "2048":"EDC22E",
    "4096":"F4DA81",
    "8192":"FBF2D5",
    "16384":"9000FF"
}
var extraInfo={ //This is stored in the secondary colors Cookie
  "gridBackground":"CDC1B4",
  "lineBorder":"BBADA0",
  "blocked":"978F86",
  "darkColor":"776e65",
  "lightColor":"F9F6F2"
}

//Tile class is the object that's stored in each array.
//console.log(board.boxes["3"].tileId);
class Tile { //A class used to reparse Board JSONs (somewhat legacy)
  constructor(id,x,y,value,owner,enabled) {
    this.x=x;
    this.y=y;
    this.value=value;
    this.id=id;
    this.owner=owner;
    this.enabled=enabled;
  }

}

//Practical side-functions
function findCurrentAnim(id,xory) { // Useful in the console to find X or Y
  var transforms=document.getElementById('tile'+id.toString()).style.transform; //Get the overarching CSS transform
  transformY=((transforms.split('translateY'))[1].slice(0,(transforms.split('translateY'))[1].length-5)); //Use slices to break the Y transform down to just x + vmin
  transformY=transformY.slice(1,transformY.length-5)
  transformX=((transforms.split('translateY'))[1].split('translateX'))[0].slice(0,(transforms.split('translateY'))[1].split('translateX')[0].length-5); //See above.
  transformX=transformX.slice(1,transformX.length-5)
  if (xory='X') { //Want to find the X animation? This checks it. The same is true for the y.
    return transformX;
  }
  if (xory='Y') {
    return transformY;
  }
  else {
    console.log("Fatal error on line 106.")
  }
}


function calcX(tileId) { //Used to parse the modulo values given in the Tile creation of newTile
  if(tileId==1) {
    return 1; //This basically turns the ID into an x value from 1-14.
  }
  if(tileId==0){
    return 14;
  }
  else {
    return tileId;
  }
}
function calcY(tileId) { //See above... but for Y
  if(tileId%14==0) {
    return tileId/14;
  }
  else {
    return Math.floor(tileId/14+1);
  }
}

function getSessionID() //This is a placeholder function, to be replaced when the server is entirely running.
{
  /*
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "http://127.0.0.1:7000", false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
  */
  return Math.random()*10000;
  }
function getColor(values) { //Takes the color of a tile with a certain number and steals it from the cookie table
  return  JSON.parse($.cookie("colorTheme"))[values.toString()];
}
function darkOrLight(bgColor) { //Thanks https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
  //Figure out if the font color should be dark or light, given a hex value
  
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 215) ?
    darkColor : lightColor;
}
var theDevil;
function jsonParser(jsonToParse) { 
  //jsonToParse is the name of the overall JSON, duh, Neil.
  //Do something with the player values here
  theDevil=jsonToParse;
  var parsedBoard={"players":{},"boxes":{}};
  for (let i=0;i<jsonToParse.players.length;i++) { 
    //This customizes the widget on the side of the screen, and adds the current players to it.
    parsedBoard.players[i+1]=jsonToParse.players[i];
    if (gameStarted==false) {
      players.push(jsonToParse.players[i].name);
      document.getElementById("player"+myPlayerNum).classList.add("indigo");
      document.getElementById("player"+myPlayerNum).classList.remove("elegant-color-dark");
      }
    document.getElementById("player"+(i+1).toString()).innerHTML=jsonToParse.players[i].name + "   " + "<span class=\"badge badge-primary badge-pill elegant-color \" id=\"player1sc\">"+jsonToParse.players[i].score+"</span>";
  }
  lockedBoxes=[];
  for (let j=0;j<jsonToParse.boxes.length;j++) {
    if (!jsonToParse.boxes[j].enabled) {
      lockedBoxes.push(j+1);
    }
    //console.log(lockedBoxes);
    if (jsonToParse.boxes[j].tileNum==0) { //Catch-all needs to be replaced soon
        continue;
      }


      testOb=jsonToParse.boxes[j];
    //Ignore; bug fixing console.log(testOb)
    // tempID=jsonToParse.boxes[j].tileId;
    asdf=testOb.tileId
    testOb.tileId=j+1;  // Sets name to tile ID.
    parsedBoard.boxes[asdf.toString()]=testOb;
  }
  drawLocked();
  // FOR NOW console.log("MRS:")
  console.log(parsedBoard)
  console.log("sacrebluwu")

  return (parsedBoard);

}

function divCleaner() { //Cleanup divs and make everything align nicely.... A lategame function, for performance optimizations.
  for (i=0;i<eventuallyRemove.length;i++) {
  document.getElementById("tile"+eventuallyRemove[i]).remove();
  console.log("Removed tile"+eventuallyRemove[i]);
}
eventuallyRemove=[];
}
//Primary Functions


function silentNew(id, Box) { //Redraws a given id with BOX data with no animation- hence, silent. See newtile, if you're confused, for further details.

  var box=new Tile(id,calcX(Box.tileId%14),calcY(Box.tileId),Box.tileNum,Box.owner,Box.enabled);
    var tile_div=document.getElementById("tile" + id);
    tile_div.className='tile';
    tile_div.innerHTML=(box.value).toString()+"<div><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);\">"+players[Box.owner-1]+"</div></div>"
    tile_div.id='tile'+(box.id).toString();
    document.getElementById('tile'+(box.id).toString()).style.transform="translate("+(transformnumx*(box.x-1))+"vmin,"+((box.y-1)*transformnumy)+"vmin)" //Original position transform
    document.getElementById('tile'+(box.id).toString()).style.backgroundColor='#'+getColor(box.value);
    document.getElementById('tile'+(box.id).toString()).style.transform=document.getElementById('tile'+(box.id).toString()).style.transform+" translateX(0vmin)"+" translateY(0vmin)"; //Original position transform
    document.getElementById('tile'+(box.id).toString()).style.color='#'+darkOrLight(getColor(box.value));

    switch(Box.tileNum) {
      case(2):
      case(4):
      case(8):
          document.getElementById('tile'+(box.id).toString()).style.fontSize='2.5vmin'; //5 max
          document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
          break;
      case(16):
      case(32):
      case(64):
        document.getElementById('tile'+(box.id).toString()).style.fontSize='2.5vmin'; //4.6 Max
        document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
        break;
      case(128):
      case(256):
      case(512):
    //    document.getElementById('tile'+(box.id).toString()).style.marginLeft='255vmin'
        document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; // 2.8 max
        document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
        break;  
      case(1024):
      case(2048):
      case(4096):
      case(8192):
         document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; // 2 max
         document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
         break;    
     case(16384):
          document.getElementById('tile'+(box.id).toString()).style.fontSize='1.7vmin'; //1.5 optimal
          document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
          break;
    }
    

  }


function newTile(id, Box) { //Draws brand new Boxes
  var box=new Tile(id,calcX(Box.tileId%14),calcY(Box.tileId),Box.tileNum,Box.owner,Box.enabled); // Turns the board box object into a compatible Tile object for easy access.
    var tile_div=document.createElement('div');
    tile_div.className='tile';
    tile_div.innerHTML=(box.value).toString()+"<div><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);\">"+players[Box.owner-1]+"</div></div>" //Work around for terrible CSS practices.
    tile_div.id='tile'+(box.id).toString();
    grid.appendChild(tile_div); //Add this to the grid element.

    document.getElementById('tile'+(box.id).toString()).style.transform="translate("+(transformnumx*(box.x-1))+"vmin,"+((box.y-1)*transformnumy)+"vmin)" //Original position transform
    document.getElementById('tile'+(box.id).toString()).style.backgroundColor='#'+getColor(box.value);
    document.getElementById('tile'+(box.id).toString()).style.transform=document.getElementById('tile'+(box.id).toString()).style.transform+" translateX(0vmin)"+" translateY(0vmin)"; //Original position transform
    anime({ //Animate it all.
      targets: '#'+'tile'+(box.id).toString(),
      scale:[{
        value:[0,1],
        duration:150,
      },
    ],
    rotation:[{
      value:['20deg','-20deg','0deg'], //Legacy animation support- easy to turn on, by changing the property name.
      duration:150,
    },
  ],
      backgroundColor: [{
        value:['#FFFFFF', '#'+getColor(box.value)], //Using the getColor function to access the stored cookie JSON
        duration:150,
      },
    ],
    
      easing: 'linear',
      
    
    })
    document.getElementById('tile'+(box.id).toString()).style.color='#'+darkOrLight(getColor(box.value)); //Simply changes font color, in accordance with the dark or light function.

    switch(Box.tileNum) { //Allows for easy switching of max font size for each character length.... eventually a very important portion of the code.
      case(2):
      case(4):
      case(8):
          document.getElementById('tile'+(box.id).toString()).style.fontSize='2.5vmin'; //5 max
          document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
          break;
      case(16):
      case(32):
      case(64):
        document.getElementById('tile'+(box.id).toString()).style.fontSize='2.5vmin'; //4.6 Max
        document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
        break;
      case(128):
      case(256):
      case(512):
    //    document.getElementById('tile'+(box.id).toString()).style.marginLeft='255vmin'
        document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; // 2.8 max
        document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
        break;  
      case(1024):
      case(2048):
      case(4096):
      case(8192):
         document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; // 2 max
         document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
         break;    
     case(16384):
          document.getElementById('tile'+(box.id).toString()).style.fontSize='1.7vmin'; //1.5 optimal
          document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
          break;
    }
    

  }
function drawLocked() { // Draw all of the locked, immobile boxes.
  $('.blocked').remove() //kill all of the current locked boxes.
  
  for (let i=0;i<lockedBoxes.length;i++) { //For each locked box, redraw it- this accomodates for blanks.
    
    var blocked_tile=document.createElement('div');
    blocked_tile.className='blocked';
    blocked_tile.id='blocked'+lockedBoxes[i];
    grid.appendChild(blocked_tile);
    var transformnumx=5.741924954411;
    var transformnumy=5.748124954411;
    document.getElementById('blocked'+(lockedBoxes[i]).toString()).style.transform="translate("+(transformnumx*(calcX(lockedBoxes[i]%14)-1))+"vmin,"+(calcY(lockedBoxes[i])-1)*transformnumy+"vmin)" //Original position transform
    document.getElementById('blocked'+(lockedBoxes[i]).toString()).style.transform=document.getElementById('blocked'+(lockedBoxes[i]).toString()).style.transform+" translateX(0vmin)"+" translateY(0vmin)"; //Original position transform

  }
  $(".blocked").css("background-color","#"+JSON.parse($.cookie("boardTheme"))["blocked"])   //Color it with the blocked box cookie.
}


function moveTile(id,Tile,FutureTile) { //TIle is the tile as it sits NOW, FutureTile is where you want it to move.
  okayWork=false; //This is a bit of a bad variable name, but in essence, it states if the player can make a move- 50ms delay, at the moment.
  var progress=0;
    ///console.log("Finding the current animation of " + id + ". It is: " + findCurrentAnim(id,"X")); Debug stuff.
    anime({
      targets: '#'+'tile'+id, //Target the appropriate div
      translateY:{
        
        value:[findCurrentAnim(id,"Y"),(((calcY(FutureTile.tileId))-calcY(Tile.tileId))*transformnumy).toString()+'vmin'], // This might make very little sense, but it's due to the way CSS animations work. You need to find the current value  of it, and work from there, hence, the excessive code.
        duration:150,
    },
      translateX:{
        value:[findCurrentAnim(id,"X"),(((((calcX(FutureTile.tileId)%14))-(calcX(Tile.tileId)%14)))*transformnumx).toString()+'vmin'],  //See above       //value:[5.735*0,5.735*-13],
        duration:150,
      },
  
      backgroundColor: [{
        value:['#'+getColor(Tile.tileNum),'#'+getColor(FutureTile.tileNum)], //Animate colors for deletion+movement animations... not implemented yet, sadly, due to some arcane bug.
        duration:150,
      }
    ],
    
      easing: 'easeInOutQuad',
      update: function() { //Change the text in a tile mid move, if it's merging.
        progress+=1
        if (progress>40 && progress<50) {
          document.getElementById('tile'+(id).toString()).style.color='#'+darkOrLight(getColor(FutureTile.tileNum));
        document.getElementById('tile'+(id).toString()).innerHTML=(FutureTile.tileNum).toString()+"<div><div style=\"font-size:1vmin;transform: translate(0, -3.2vmin);\">"+players[FutureTile.owner-1]+"</div></div>"
        }
      },
      complete: function() {
          silentNew(id,FutureTile); //Reset the CSS properties with a silent deletion
          okayWork=true; //Allow another move to be made
      }
    
    })
  }
function deleteTile(id, Tile) { //Play delete animation then kick that sorry thing off of the array.
  console.log("DELETING " +id)
  anime({ //Animate deletions.
    targets: '#'+'tile'+id,
    scale:[{
      value:0,
      duration:150,
    },
  ],
  rotation:[{
    value:'1turn',
    duration:150,
  },
],
    backgroundColor: [{
      value:['#'+getColor(Tile.tileNum), '#FFFFFF'],
      duration:150,
    },
  ],
  
    easing: 'linear',
    
  
  })
  eventuallyRemove.push((id).toString()); //Add it to the eventually remove array.
  document.getElementById('tile'+id).remove(); //Actually remove the div.
}

function drawMovement(newBoard) { //Draw all movement using the most recent array as source, and an input one from the JSON parser.
board=newBoard; 
oldnew= JSON.parse(JSON.stringify(newBoard)); //This is the way garbage languages like JS require you to obfuscate a memory location.
  //Find Key Differences
newArrayKeys=(Object.keys(newBoard.boxes)); //Find the keys, or ids, of each box in both arrays.
newArrayKeys=newArrayKeys.map(function (x) { 
  return parseInt(x, 10); 
});
console.log("THE NEW BOARD IS: "+ newArrayKeys)
//console.log(newArrayKeys)
currentArrayKeys=Object.keys(oldBoard.boxes);
currentArrayKeys=currentArrayKeys.map(function (x) { 
  return parseInt(x, 10); 
});
console.log("THE OLD BOARD IS: "+ currentArrayKeys)
//First, you find if there are any elements newArrayKeys has that the current one doesn't (additions)

additions=[]
additions=newArrayKeys.filter(x => !currentArrayKeys.includes(x))
console.log("Done adding " + additions)
//console.log(additions);
//Then, you check to see if there are any elements (by id) that the old array has and new doesn't  (deletions)
deletions=[]
console.log("The board will contain "+ newArrayKeys)
console.log("The board currently contains"+ currentArrayKeys)

deletions=currentArrayKeys.filter(x => !newArrayKeys.includes(x))

console.log("Done deleting " + deletions)

//Remove these from the lists; they'll be parsed seperately
//Parse Deletions

do{
  if (additions.length>0) {
  newTile(additions[0],newBoard.boxes[additions[0]]);
  delete newBoard.boxes[additions[0]];
  delete currentArrayKeys[additions[0]];
  additions.shift();
  }
  }while(additions.length>0); 
ketamine=currentArrayKeys.filter(x => newArrayKeys.includes(x)); //Don't ask about the variable name.... this one was painful. These filters ultimately look for intersections in both arrays. Simple.
console.log(ketamine);
var i=0;
  for (i in ketamine) {
    if (true /*idInCurrentArray(ketamine)[0]*/) {
      if (debug) {
      console.log("RECIEVED"+i)
      }
      console.log(ketamine[i] + 'SENT')
      moveTile(ketamine[i],oldBoard.boxes[ketamine[i]],newBoard.boxes[ketamine[i]]);
    //  console.log(Box)
    }
   }
do{
  if (deletions.length>0) {
    deleteTile(deletions[0],oldBoard.boxes[deletions[0]]);
    deletions.shift();
  }
}while(deletions.length>0); 
  console.log("THE OLD BOARD WAS" + Object.keys(oldBoard.boxes))
  oldBoard=oldnew;
  console.log("THE OLD BOARD IS" + Object.keys(oldBoard.boxes))


}


//Listeners
document.addEventListener('keyup', function(event){// Read keypresses
  //var socket = new WebSocket('wss://tfrserver.herokuapp.com'); 
  //alert(event.keyCode); (Uncomment this line if you need to add future keyswitch codes)
  if (true && gameStarted && okayWork) {
    //var socket = new WebSocket('wss://tfrserver.herokuapp.com'); 
    switch(event.keyCode) {
      case 87:
      case 38:
       // alert("Up! To be replaced by sockets when ready.");
        socket.send(JSON.stringify({
          msgType: "playerMove",
          direction: "up",
          sessionID:JSON.parse($.cookie("sessionID")).toString()
        }));
        okayWork=false;
        if (debug) {console.log(
          JSON.stringify({
            msgType: "playerMove",
            direction: "up",
            sessionID:JSON.parse($.cookie("sessionID")).toString()
          }))
        }
        
        break;
      case 39:
      case 68:
       //   alert("Right! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playerMove",
            direction: "right",
            sessionID:JSON.parse($.cookie("sessionID")).toString()
          }));
          okayWork=false;

          if (debug) {console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "right",
              sessionID:JSON.parse($.cookie("sessionID")).toString()
            }))
          }
          break;
      case 40:
      case 83:
        //  alert("Down! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playerMove",
            direction: "down",
            sessionID:JSON.parse($.cookie("sessionID")).toString()
          }));
          okayWork=false;

          if (debug) {console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "down",
              sessionID:JSON.parse($.cookie("sessionID")).toString()
            }))
          }
          
          break;
      case 37:
      case 65:
         // alert("Left! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playerMove",
            direction: "left",
            sessionID:JSON.parse($.cookie("sessionID")).toString()
          }));
          okayWork=false;

          if (debug) {console.log(
            JSON.stringify({
              msgType: "playerMove",
              direction: "left",
              sessionID:JSON.parse($.cookie("sessionID")).toString()
            }))
          }
          break;

    }
  }
} );
window.addEventListener("keydown", function(e) { // Prevent scrolling
  // space and arrow keys
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
  }
}, false);

var stringJSON;
window.onload = function () { //Ensure that sockets work when the site first loads 


//Random Jquery Stuff to keep site running
$('#title').on('click', function(event) {
  window.location.href = "index.html";
  console.log('home')
});

$('.newBox').on('click', function(event) {
  if (true) { //REPLACE WITH SCORE FUNCTION SOON !!!!!!!IMPORTANT!!!!!!!!!!!
    $(".blocked").css({"border-color": "#FFFFF", 
    "border-width":"1px", 
    "border-style":"solid"});
    boxClicked=true;
  }
});
$(document).on('click', '.blocked', function() {
  var id =$(this).attr('id').split("blocked")[1];
  console.log(id);
  let xValue=calcX(id%14)-1;
  let yValue=calcY(id)-1; 
  console.log(xValue + "," + yValue);
  if (boxClicked) {
 
    socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
      msgType: "unlockBox",
      sessionID: sessionID.toString(),
      'row':yValue.toString(),
      'col':xValue.toString(),
    }));
    delete document.getElementById('blocked'+id);
  }
});
//Cookie Jar
if (document.cookie.indexOf('colorTheme')==-1) {
  $.cookie("colorTheme", JSON.stringify(theme1));
}

if (document.cookie.indexOf('boardTheme')==-1) {
    $.cookie("boardTheme", JSON.stringify(extraInfo));
}
$(".vline, .hline").css("background-color","#"+JSON.parse($.cookie("boardTheme"))["lineBorder"]);  
$(".grid").css("border","2vmin solid #"+JSON.parse($.cookie("boardTheme"))["lineBorder"]);  
$(".grid").css("background-color","#"+JSON.parse($.cookie("boardTheme"))["gridBackground"]);
darkColor=JSON.parse($.cookie("boardTheme"))["darkColor"];
lightColor=JSON.parse($.cookie("boardTheme"))["lightColor"];


  // Create a new WebSocket.
   //var socket = new WebSocket('ws://echo.websocket.org');
  socket = new WebSocket('wss://tfrserver.herokuapp.com'); 


  // Handle any errors that occur.
  socket.onerror = function (error) {
    console.log('WebSocket Error: ' + error);
  };


  // Show a connected message when the WebSocket is opened.
  socket.onopen = function (event) {
    console.log("Socket is connected.");
    if (document.cookie.indexOf('sessionID')==-1) {
      sessionID=getSessionID();
      $.cookie("sessionID", JSON.stringify(sessionID),{ expires: .5 });
   /* Uncomment this when you want cookie persistence
      socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
      msgType: "signup",
      sessionID: sessionID.toString(),
      name: "Billy Bob"
    }));
    */
      }
      else {
        console.log(JSON.parse($.cookie("sessionID")))
        sessionID= JSON.parse($.cookie("sessionID"))
      }
    socket.send(JSON.stringify({ //Modify this with cookies, to make sure one player gets reconnected with their correct session etc... and can't join several times.
      msgType: "signup",
      sessionID: sessionID.toString(),
      name: "Player"+Math.floor(Math.random()*10)
    }));
  };

/*
<div class="alert alert-dark" role="alert">
  A simple dark alert with <a href="#" class="alert-link">an example link</a>. Give it a click if you like.
</div>
*/

  // Handle messages sent by the server.
  socket.onmessage = function (event) {
    if (debug) {console.log(event.data)};
    stringJSON=event.data;
    data=(JSON.parse(event.data));

    console.log(data.msgType)
    switch(data.msgType) {
      case 'boardUpdate':
        parsedBoard=jsonParser(data.board)
        $.cookie("lastBoard", JSON.stringify(parsedBoard)); //Also log currentArray, somehow, in order to redraw smooothly.
        //console.log(parsedBoard);
        drawMovement(parsedBoard);
        gameStarted=true;
        recentboard=jsonParser(data.board);
        break
      case 'waitingForPlayers':
        /*
        if (myPlayerNum==4) {
          myPlayerNum=4-data.numLeft;
          changemade=true;
        }
        */
        /*if (gameStarted==false) {
          document.getElementById("player"+myPlayerNum).classList.add("indigo");
          document.getElementById("player"+myPlayerNum).classList.remove("elegant-color-dark");
          }*/
          if(!$("#googlymoogle").length) {
            var alert = document.createElement('div');
            alert.className='alert alert-dismissible alert-dark fade show';
            alert.id='googlymoogle'
            alert.role="alert";
            alert.innerHTML="Welcome to the queue. We are currently waiting on "+data.numLeft+" players. Thank you for your patience.";
            document.getElementById("alertCenter").appendChild(alert);
      }
      else {
        document.getElementById("googlymoogle").innerHTML="Welcome to the queue. We are currently waiting on "+data.numLeft+" players. Thank you for your patience.";
      }
      if (data.numLeft==0) {
        $('#googlymoogle').alert('close');
      }
      $('#googlymoogle').on('click', function(event) {
        $('#googlymoogle').alert('close');
      })
      break;
      case 'gameStarting':
          gameStarted=false;
          changemade=true;
          if(!$("#googlymoogle").length) {
            $('#googlymoogle').alert('close');
          }
          break;
      case 'ERR':
        console.log(data);
        console.log("FATAL ERROR IN WEBSOCKET- COLLECTING LOG");
        break;
      case 'yourPlayerId':
        myPlayerNum=data.id;
        if (gameStarted==false) {
          document.getElementById("player"+myPlayerNum).classList.add("indigo");
          document.getElementById("player"+myPlayerNum).classList.remove("elegant-color-dark");
          }
      case 'gameOver':
        //Delete Cookies
      
         
  };


  // Show a disconnected message when the WebSocket is closed.
  socket.onclose = function (event) {
    console.log("Socket is disconnected");
    location.reload();
  };
  


 //Send a signup request as soon as the socket is connected


};

}
