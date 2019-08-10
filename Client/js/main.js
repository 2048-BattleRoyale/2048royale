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
var lastStrokeTime;
var packetSent = false;
var playerAlive = true;
var currentArray=[];
var modernArray=[];
var players=[];
var eventuallyRemove=[];
var socket = new WebSocket('ws://127.0.0.1:8000/');
var board = {"players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"boxes":{"1":{"enabled":true,"tileNum":2,"tileId":1,"owner":1,"justMerged":false},"2":{"enabled":true,"tileNum":512,"tileId":85,"owner":2,"justMerged":false},"3":{"enabled":true,"tileNum":4096,"tileId":96,"owner":1,"justMerged":false},"4":{"enabled":true,"tileNum":128,"tileId":37,"owner":1,"justMerged":false},"5":{"enabled":true,"tileNum":32,"tileId":193,"owner":1,"justMerged":false},"6":{"enabled":true,"tileNum":2,"tileId":112,"owner":1,"justMerged":false},"7":{"enabled":true,"tileNum":256,"tileId":196,"owner":1,"justMerged":false}}};
var boardTest = {"players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"boxes":{"1":{"enabled":true,"tileNum":2,"tileId":2,"owner":1,"justMerged":false},"4":{"enabled":true,"tileNum":128,"tileId":21,"owner":1,"justMerged":false},"5":{"enabled":true,"tileNum":32,"tileId":12,"owner":1,"justMerged":false},"6":{"enabled":true,"tileNum":2,"tileId":98,"owner":1,"justMerged":false},"7":{"enabled":true,"tileNum":256,"tileId":34,"owner":1,"justMerged":false},"8":{"enabled":true,"tileNum":4096,"tileId":88,"owner":1,"justMerged":false},"9":{"enabled":true,"tileNum":2,"tileId":127,"owner":1,"justMerged":false},"10":{"enabled":true,"tileNum":16,"tileId":63,"owner":1,"justMerged":false}}};
var boardTestTest={"players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"boxes":{"1":{"enabled":true,"tileNum":2,"tileId":2,"owner":1,"justMerged":false},"4":{"enabled":true,"tileNum":128,"tileId":21,"owner":1,"justMerged":false},"5":{"enabled":true,"tileNum":32,"tileId":12,"owner":1,"justMerged":false},"6":{"enabled":true,"tileNum":2,"tileId":98,"owner":1,"justMerged":false},"9":{"enabled":true,"tileNum":2,"tileId":51,"owner":1,"justMerged":false},"11":{"enabled":true,"tileNum":4,"tileId":25,"owner":1,"justMerged":false}}};
badJSON={"players":[{"name":"Billy Bob","score":0},{"name":"Jane Bob","score":4},{"name":"Joe Smith","score":2220},{"name":"Jack Sprat","score":0}],"boxes":[{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":2,"tileId":2,"owner":1},{"enabled":true,"tileNum":2,"tileId":3,"owner":1},{"enabled":true,"tileNum":64,"tileId":1,"owner":3},{"enabled":true,"tileNum":2,"tileId":4,"owner":1},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":2,"tileId":6,"owner":1},{"enabled":true,"tileNum":2,"tileId":7,"owner":1},{"enabled":true,"tileNum":2,"tileId":5,"owner":2},{"enabled":true,"tileNum":2,"tileId":8,"owner":1},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},
{"enabled":true,"tileNum":128,"tileId":19,"owner":3},{"enabled":true,"tileNum":16384,"tileId":17,"owner":2},{"enabled":true,"tileNum":2048,"tileId":18,"owner":4},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":2,"tileId":10,"owner":1},{"enabled":true,"tileNum":2,"tileId":11,"owner":1},{"enabled":true,"tileNum":2,"tileId":9,"owner":3},{"enabled":true,"tileNum":4,"tileId":12,"owner":2},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":2,"tileId":14,"owner":1},{"enabled":true,"tileNum":2,"tileId":15,"owner":1},{"enabled":true,"tileNum":2,"tileId":13,"owner":4},{"enabled":true,"tileNum":2,"tileId":16,"owner":1},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":true,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0},{"enabled":false,"tileNum":0,"tileId":0,"owner":0}]};
var newBoard;
var gamestarted=false;
var sessionID;
var myPlayerNum=4;
var lockedBoxes=[];
//Test/Example board used for testing out a real board object.
//Color Profiles Stored Dynamically Online- this is the default
var theme1={ //This is a blue and pink theme. 
  "2":"A8DEF5",
  "4":"AFDBF3",
  "8":"B7D8F2",
  "16":"BFD5F1",
  "32":"C7D2EF",
  "64":"CFCFEE",
  "128":"D6CCED",
  "256":"DEC9EC",
  "512":"E6C6EA",
  "1024":"EEC3E9",
  "2048":"F6C0E8",
  "4096":"FEBEE7",
  "8192":"FF8AD5",
  "16384":"FF47BD"
  }

//Tile class is the object that's stored in each array.
//console.log(board.boxes["3"].tileId);
class Tile {
  constructor(id,x,y,value,owner,enabled) {
    this.x=x;
    this.y=y;
    this.value=value;
    this.id=id;
    this.owner=owner;
    this.enabled=enabled;
  }

}


console.log(currentArray)

//Practical side-functions
function findCurrentAnim(id,xory) { // Useful in the console to find X or Y
  var transforms=document.getElementById('tile'+id.toString()).style.transform;
  transformY=((transforms.split('translateY'))[1].slice(1,(transforms.split('translateY'))[1].length-5));
  transformX=((transforms.split('translateY'))[1].split('translateX'))[0].slice(1,(transforms.split('translateY'))[1].split('translateX')[0].length-5);
  if (xory='X') {
    return transformX;
  }
  if (xory='Y') {
    return transformY;
  }
  else {
    console.log("Fatal error on line 85.")
  }
}

function calcX(tileId) { //Used to parse the modulo values given in the Tile creation of newTile
  if(tileId==1) {
    return 1;
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
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
function findposbyID(ID) { //Give this function an ID from a current Tile and it'll tell you its position in the array
  for (i=0;i<currentArray.length;i++) {
      if (currentArray[i].id == ID) {
        return i;
        break;
      }
  }
}
function getSessionID()
{
  /*
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "http://127.0.0.1:7000", false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
  */
  return Math.random()*10000;
  }
function getColor(values) {
  return  JSON.parse($.cookie("colorTheme"))[values.toString()];
  // Future code here will allow for switchable themes that are admittedly quite snazzy
}

function jsonParser(miscommunication) {
  //Do something with the player values here
  var goodboard={"players":{},"boxes":{}};
  for (let i=0;i<miscommunication.players.length;i++) {
    goodboard.players[i+1]=miscommunication.players[i];
    if (gamestarted==false) {
      players.push(miscommunication.players[i].name);
      document.getElementById("player"+myPlayerNum).classList.add("indigo");
      document.getElementById("player"+myPlayerNum).classList.remove("elegant-color-dark");
      }
    document.getElementById("player"+(i+1).toString()).innerHTML=miscommunication.players[i].name + "   " + "<span class=\"badge badge-primary badge-pill elegant-color \" id=\"player1sc\">"+miscommunication.players[i].score+"</span>";
  }
  console.log(goodboard.players);
  console.log(players)
  for (let j=0;j<miscommunication.boxes.length;j++) {
  //  console.log("found box"+(j+1));
  if (!miscommunication.boxes[j].enabled) {
    lockedBoxes.push(j);
  }
  if (miscommunication.boxes[j].tileNum==0) { //Catch-all needs to be replaced soon
      continue;
    }


    testOb=miscommunication.boxes[j];
   //Ignore; bug fixing console.log(testOb)
    tempID=miscommunication.boxes[j].tileId;
    testOb.tileId=j+1;
    goodboard.boxes[tempID.toString()]=testOb;
  }
  // FOR NOW console.log("MRS:")
  return (goodboard);

}

function divCleaner() { //Cleanup divs and make everything align
  for (i=0;i<eventuallyRemove.length;i++) {
  document.getElementById("tile"+eventuallyRemove[i]).remove();
  console.log("Removed tile"+eventuallyRemove[i]);
}
eventuallyRemove=[];
}
//Primary Functions

function newTile(Box) {
  //console.log(Box);
  var box=new Tile(totalB+1,calcX(Box.tileId%14),calcY(Box.tileId),Box.tileNum,Box.owner,Box.enabled);
  totalB+=1;
  currentArray.push(box);  
    var tile_div=document.createElement('div');
    tile_div.className='tile';
    tile_div.innerHTML=(box.value).toString()+"<div><div style=\"font-size:1vmin;transform: translate(0, -3.5vmin);\">"+players[Box.owner-1]+"</div></div>"
    tile_div.id='tile'+(box.id).toString();
    grid.appendChild(tile_div);
    var transformnumx=5.741924954411;
    var transformnumy=5.748124954411;

   // document.getElementById('tile'+(Tile.id).toString()).style.transform="translate(1vmin,0vmin)" //Static transform to accomodate for the earlier margin one
    document.getElementById('tile'+(box.id).toString()).style.transform="translate("+(transformnumx*(box.x-1))+"vmin,"+((box.y-1)*transformnumy)+"vmin)" //Original position transform
    document.getElementById('tile'+(box.id).toString()).style.backgroundColor='#'+getColor(box.value);
    document.getElementById('tile'+(box.id).toString()).style.transform=document.getElementById('tile'+(box.id).toString()).style.transform+" translateX(0vmin)"+" translateY(0vmin)"; //Original position transform
    anime({
      targets: '#'+'tile'+(box.id).toString(),
      scale:[{
        value:[0,1],
        duration:300,
      },
    ],
    rotation:[{
      value:['20deg','-20deg','0deg'],
      duration:300,
    },
  ],
      backgroundColor: [{
        value:['#FFFFFF', '#'+getColor(box.value)],
        duration:300,
      },
    ],
    
      easing: 'linear',
      
    
    })
    
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
function idInCurrentArray(id) {
  for (let i=0;i<currentArray.length;i++) {
    if (currentArray[i].id==parseInt(id,10)) {
      return [true,i];
      break;
    }
  }
  return false;
}

function moveTile(Tile,FutureTile) { //TIle is the tile as it sits NOW, FutureTile is where you want it to move.
//console.log(Tile.y)
  var progress=0;
    anime({
      targets: '#'+'tile'+(Tile.id).toString(),
      translateY:{
        
        value:['0vmin',((FutureTile.y-Tile.y)*5.735).toString()+'vmin'],
        duration:300,
    },
      translateX:{
        value:['0vmin',((FutureTile.x-Tile.x)*5.735).toString()+'vmin'],        //value:[5.735*0,5.735*-13],
        duration:300,
      },
  
      backgroundColor: [{
        value:['#'+getColor(Tile.value),'#'+getColor(FutureTile.value)],
        duration:300,
      }
    ],
    
      easing: 'easeInOutQuad',
      update: function() {
        progress+=1
        if (progress>40) {
        document.getElementById('tile'+(Tile.id).toString()).innerHTML=(FutureTile.value).toString()+"<div><div style=\"font-size:1vmin;transform: translate(0, -3.5vmin);\">"+players[FutureTile.owner-1]+"</div></div>"
        }
      }
    
    
    })
    //document.getElementById('tile'+(Tile.id).toString()).innerHTML=(FutureTile.value).toString()+'\n'; This is a blanket update, the progress updater above will do a better job 99% of the time, but uncomment this if a corner-case arises
    currentArray[findposbyID(Tile)]=FutureTile;
  }
function deleteTile(Tile) { //Play delete animation then kick that sorry thing off of the array.
  anime({
    targets: '#'+'tile'+(Tile.id).toString(),
    scale:[{
      value:0,
      duration:300,
    },
  ],
  rotation:[{
    value:'1turn',
    duration:300,
  },
],
    backgroundColor: [{
      value:['#'+getColor(Tile.value), '#FFFFFF'],
      duration:300,
    },
  ],
  
    easing: 'linear',
    
  
  })
  currentArray.splice(findposbyID(Tile.id),1);//Remove that filthy, filthy div from existence as we know it.
  eventuallyRemove.push((Tile.id).toString());
}
function firstDraw(tempBoard) { //When the board is first recieved, call this function on it.
      for (let i=1; i<(Object.keys(tempBoard.boxes).length+1);i++) {
     //console.log(Board.boxes[i.toString()]);
//     console.log(tempBoard.boxes[i+1]) 
     newTile(tempBoard.boxes[i]);
    }
    console.log("Setup Complete. Now Waiting.");

}

function drawMovement(newBoard) {

board=newBoard;
  //Find Key Differences
newArrayKeys=(Object.keys(newBoard.boxes));
newArrayKeys=newArrayKeys.map(function (x) { 
  return parseInt(x, 10); 
});
//console.log(newArrayKeys)
currentArrayKeys=[];
for (i=0;i<currentArray.length;i++) {
  currentArrayKeys.push(currentArray[i].id);
}
//First, you find if there are any elements newArrayKeys has that the current one doesn't (additions)
additions=[]
additions2=[];
for(i=0;i<newArrayKeys.length;i++) {
  found=false;
  for(j=0;j<currentArrayKeys.length;j++) {
    if (newArrayKeys[i]==currentArrayKeys[j]) {
      found=true;
    }
  }
  
  if (!found) {
    additions.push(newArrayKeys[i]);
    additions2.push(newArrayKeys[i]);
  }
}
console.log(additions);
//Then, you check to see if there are any elements (by id) that the old array has and new doesn't  (deletions)
deletions=[]
for(i=0;i<currentArrayKeys.length;i++) {
  found=false;
  for(j=0;j<newArrayKeys.length;j++) {
    if (currentArrayKeys[i]==newArrayKeys[j]) {
      found=true;
    }
  }
  
  if (!found) {
    deletions.push(currentArrayKeys[i]);
  }
}
console.log(deletions);
//Remove these from the lists; they'll be parsed seperately
//Parse Deletions
do{
  if (deletions.length>0) {
    deleteTile(currentArray[idInCurrentArray(deletions[0])[1]]);
    deletions.shift();
  }
}while(deletions.length>0); 
do{
  if (additions.length>0) {
  newTile(newBoard.boxes[additions[0]]);
  delete newBoard.boxes[additions[0]];
  additions.shift();
  }
  }while(additions.length>0); 
console.log(newBoard);


ketamine=Object.keys(newBoard.boxes);
var i=0;
  for (i in ketamine) {
    if (true /*idInCurrentArray(ketamine)[0]*/) {
      console.log("RECIEVED"+i)
      Box=newBoard.boxes[ketamine[i]];
      moveTile(currentArray[idInCurrentArray(ketamine[i])[1]],new Tile(ketamine[i],calcX(Box.tileId%14),calcY(Box.tileId),Box.tileNum,Box.owner,Box.enabled));
    }
   }


}


//Listeners
document.addEventListener('keyup', function(event){
  //alert(event.keyCode); (Uncomment this line if you need to add future keyswitch codes)
  if (true && gamestarted) {
    switch(event.keyCode) {
      case 87:
      case 38:
        alert("Up! To be replaced by sockets when ready.");
        socket.send(JSON.stringify({
          msgType: "playMove",
          direction: "up",
          sessionID:JSON.parse($.cookie("sessionID"))
        }));
        break;
      case 39:
      case 68:
          alert("Right! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playMove",
            direction: "right",
            sessionID:JSON.parse($.cookie("sessionID"))
          }));
          break;
      case 40:
      case 83:
          alert("Down! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playMove",
            direction: "down",
            sessionID:JSON.parse($.cookie("sessionID"))
          }));
          break;
      case 37:
      case 65:
          alert("Left! To be replaced by sockets when ready.");
          socket.send(JSON.stringify({
            msgType: "playMove",
            direction: "left",
            sessionID:JSON.parse($.cookie("sessionID"))
          }));
          break;

    }
  }
} );
window.onload = function () {
//Add something here which reenables firstdraw

  if (document.cookie.indexOf('colorTheme')==-1) {
    $.cookie("colorTheme", JSON.stringify(theme1));
  }
  // Create a new WebSocket.
   //var socket = new WebSocket('ws://echo.websocket.org');
  var socket = new WebSocket('ws://localhost:8000'); 


  // Handle any errors that occur.
  socket.onerror = function (error) {
    console.log('WebSocket Error: ' + error);
  };


  // Show a connected message when the WebSocket is opened.
  socket.onopen = function (event) {
    console.log("Socket is connected.");
    if (document.cookie.indexOf('sessionID')==-1) {
      sessionID=getSessionID();
      $.cookie("sessionID", JSON.stringify(sessionID),{ expires: .005 });
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
    console.log(event);
    data=(JSON.parse(event.data));
    console.log(data.msgType)
    switch(data.msgType) {
      case 'boardUpdate':
        testBoard=jsonParser(data.board)
        console.log(testBoard);
        if (gamestarted==false) {
        firstDraw(testBoard);
        gamestarted=true;
        }
        else {
          drawMovement(testBoard);
        }
      break
      case 'waitingForPlayers':
        if (myPlayerNum==4) {
          myPlayerNum=4-data.numLeft;
          changemade=true;
        }
        if (gamestarted==false) {
          document.getElementById("player"+myPlayerNum).classList.add("indigo");
          document.getElementById("player"+myPlayerNum).classList.remove("elegant-color-dark");
          }
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
          gamestarted=false;
          changemade=true;
          if(!$("#googlymoogle").length) {
            $('#googlymoogle').alert('close');
          }
          break;
      case 'ERR':
        console.log("FATAL ERROR IN WEBSOCKET- COLLECTING LOG");
        break;
      
         
  };


  // Show a disconnected message when the WebSocket is closed.
  socket.onclose = function (event) {
    console.log("Socket is disconnected");
    var socket = new WebSocket('ws://localhost:8000'); 
  };
  


 //Send a signup request as soon as the socket is connected


};
$('#title').on('click', function(event) {
  window.location.href = "index.html";
  console.log('he')
});
}
//window.onload();

//Main Loop
while (false) {
  break;
}

/*
//firstDraw(board);
newBoard=jsonParser(badJSON);
console.log(newBoard);
firstDraw(newBoard);

*/
