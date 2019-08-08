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
var players={};
var eventuallyRemove=[];
var socket = new WebSocket('ws://echo.websocket.org');
var board = {"Players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"Boxes":{"1":{"enabled":true,"tileNum":2,"tileID":1,"owner":1,"justMerged":false},"2":{"enabled":true,"tileNum":512,"tileID":85,"owner":2,"justMerged":false},"3":{"enabled":true,"tileNum":4096,"tileID":96,"owner":1,"justMerged":false},"4":{"enabled":true,"tileNum":128,"tileID":37,"owner":1,"justMerged":false},"5":{"enabled":true,"tileNum":32,"tileID":193,"owner":1,"justMerged":false},"6":{"enabled":true,"tileNum":2,"tileID":112,"owner":1,"justMerged":false},"7":{"enabled":true,"tileNum":256,"tileID":196,"owner":1,"justMerged":false}}};
var boardTest = {"Players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"Boxes":{"1":{"enabled":true,"tileNum":2,"tileID":2,"owner":1,"justMerged":false},"4":{"enabled":true,"tileNum":128,"tileID":21,"owner":1,"justMerged":false},"5":{"enabled":true,"tileNum":32,"tileID":12,"owner":1,"justMerged":false},"6":{"enabled":true,"tileNum":2,"tileID":98,"owner":1,"justMerged":false},"7":{"enabled":true,"tileNum":256,"tileID":34,"owner":1,"justMerged":false},"8":{"enabled":true,"tileNum":4096,"tileID":88,"owner":1,"justMerged":false},"9":{"enabled":true,"tileNum":2,"tileID":127,"owner":1,"justMerged":false},"10":{"enabled":true,"tileNum":16,"tileID":63,"owner":1,"justMerged":false}}};

//Test/Example board used for testing out a real board object.
//console.log(board.Players[1].Score);
//Color Profiles
var theme1={ //This is a blue and pink theme. More will be added in the future, selected with html buttons
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
//console.log(board.Boxes["3"].tileID);
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

// Generate a test array for number manipulation
/*
var extrarows=0;
for (let i=1;i<15;i++) {
  for (let j=0;j<14;j++) {
    currentArray.push(new Tile(14*(i-1)+j+extrarows,j,i,Math.pow(2,1+(Math.floor(Math.random() * 12)))));
  }
  extrarows+=1;
}
*/
console.log(currentArray)
//console.log(currentArray[1]); //Check to make sure IDs are still logical

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
    console.log("Fatal error on line 87.")
  }
}

function calcX(tileID) { //Used to parse the modulo values given in the Tile creation of newTile
  if(tileID==1) {
    return 1;
  }
  if(tileID==0){
    return 14;
  }
  else {
    return tileID;
  }
}
function calcY(tileID) { //See above... but for Y
  if(tileID%14==0) {
    return tileID/14;
  }
  else {
    return Math.floor(tileID/14+1);
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
function getColor(values) {
  return  JSON.parse($.cookie("colorTheme"))[values.toString()];
  // Future code here will allow for switchable themes that are admittedly quite snazzy
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
  console.log(Box);
  var box=new Tile(totalB+1,calcX(Box.tileID%14),calcY(Box.tileID),Box.tileNum,Box.owner,Box.enabled);
  totalB+=1;
  currentArray.push(box);  
    var tile_div=document.createElement('div');
    tile_div.className='tile';
    tile_div.innerHTML=(box.value).toString()+'\n';
    tile_div.id='tile'+(box.id).toString();
    grid.appendChild(tile_div);
   // document.getElementById('tile'+(Tile.id).toString()).style.transform="translate(1vmin,0vmin)" //Static transform to accomodate for the earlier margin one
    document.getElementById('tile'+(box.id).toString()).style.transform="translate("+(+5.735*(box.x-1))+"vmin,"+((box.y-1)*5.735)+"vmin)" //Original position transform
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
          document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; //5 max
          document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
          break;
      case(16):
      case(32):
      case(64):
        document.getElementById('tile'+(box.id).toString()).style.fontSize='2vmin'; //4.6 Max
        document.getElementById('tile'+(box.id).toString()).style.lineHeight='5vmin';
        break;
      case(128):
      case(256):
      case(512):
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
console.log(Tile.y)
  var progress=0;
    anime({
      targets: '#'+'tile'+(Tile.id).toString(),
      translateY:{
        
        value:['0vmin',((FutureTile.y-Tile.y)*5.735).toString()+'vmin'],
        //value:[5.735*0,5.735*-13],
        duration:300,
    },
      translateX:{
        value:['0vmin',((FutureTile.x-Tile.x)*5.735).toString()+'vmin'],        //value:[5.735*0,5.735*-13],
        duration:300,
      },
  
      backgroundColor: [{
        value:['#'+getColor(Tile.value),'#'+getColor(FutureTile.value)],
      }
    ],
    
      easing: 'easeInOutQuad',
      update: function() {
        progress+=1
        if (progress>40) {
        document.getElementById('tile'+(Tile.id).toString()).innerHTML=(FutureTile.value).toString()+'\n';
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
function firstDraw(Board) { //When the board is first recieved, call this function on it.
      for (let i=1; i<(Object.keys(Board.Boxes).length+1);i++) {
     //console.log(Board.Boxes[i.toString()]);
      newTile(Board.Boxes[i.toString()]);
    }
    players=Board.Players;
    console.log("Setup Complete. Now Waiting.");

}

function drawMovement(newBoard) {

board=newBoard;
  //Find Key Differences
newArrayKeys=(Object.keys(newBoard.Boxes));
newArrayKeys=newArrayKeys.map(function (x) { 
  return parseInt(x, 10); 
});
console.log(newArrayKeys)
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
deleteTile(currentArray[idInCurrentArray(deletions[0])[1]]);
deletions.shift();
}while(deletions.length>0); 
do{
  newTile(newBoard.Boxes[additions[0]]);
  delete newBoard.Boxes[additions[0]];
  additions.shift();
  }while(additions.length>0); 
console.log(newBoard);

//Move Everything Else
ketamine=Object.keys(newBoard.Boxes);
var i=0;
  for (i in ketamine) {
    if (true /*idInCurrentArray(ketamine)[0]*/) {
      console.log("RECIEVED"+i)
      Box=newBoard.Boxes[ketamine[i]];
      console.log(Box);
      moveTile(currentArray[idInCurrentArray(ketamine[i])[1]],new Tile(ketamine[i],calcX(Box.tileID%14),calcY(Box.tileID),Box.tileNum,Box.owner,Box.enabled));
    }
   }

//Parse Additions
//drawMovement(boardTest);

/*
do{
  newTile(newBoard.Boxes[additions[0]]);
  additions.shift();
  }while(additions.length>0); 
*/ ///May need this later uwu
  //Handle the corners, and make them fancy
  /*
  for(i=0;i<currentArray.length;i++) {
    if(currentArray[i].x ==  0 && currentArray.y == 0) {
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderTopLeftRadius ='2vmin'; 

    }
    if(currentArray[i].x ==  14 && currentArray.y == 0) {
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderTopRightRadius ='2vmin'; 
    }
    if(currentArray[i].x ==  0 && currentArray.y == 14) {
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderBottomLeftRadius ='2vmin'; 

    }
    if(currentArray[i].x ==  14 && currentArray.y == 14) {
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderBottomRightRadius ='2vmin'; 
    }
    if (((currentArray[i].x ==  14 && currentArray.y == 14) == false) && ((currentArray[i].x ==  0 && currentArray.y == 14) == false) && ((currentArray[i].x ==  14 && currentArray.y == 0) == false) && ((currentArray[i].x ==  0 && currentArray.y == 0)==false)) {
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderBottomRightRadius ='1vmin'; 
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderBottomLeftRadius ='1vmin'; 
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderTopRightRadius ='1vmin'; 
      document.getElementById('tile'+(currentArray[i].id).toString()).style.borderTopLeftRadius ='1vmin'; 

    }
  }
  */ //The corners were too fancy for the modern era... give it time.
}


//Listeners
document.addEventListener('keydown', function(event){
  //alert(event.keyCode); (Uncomment this line if you need to add future keyswitch codes)
  switch(event.keyCode) {
    case 87:
    case 38:
      alert("Up! To be replaced by sockets when ready.");
      socket.send({
        "msgType": "playerMove",
        "direction": "up"
      })
      break;
    case 39:
    case 68:
        alert("Right! To be replaced by sockets when ready.");
        socket.send({
          "msgType": "playerMove",
          "direction": "right"
        })
        break;
    case 40:
    case 83:
        alert("Down! To be replaced by sockets when ready.");
        socket.send({
          "msgType": "playerMove",
          "direction": "down"
        })
        break;
    case 37:
    case 65:
        alert("Left! To be replaced by sockets when ready.");
        socket.send({
          "msgType": "playerMove",
          "direction": "left"
        })
        break;

  }
} );
window.onload = function () {
if (document.cookie.indexOf('colorTheme')==-1) {
  $.cookie("colorTheme", JSON.stringify(theme1));
}
  // Create a new WebSocket.
   var socket = new WebSocket('ws://echo.websocket.org');
  //var socket = new WebSocket('ws://localhost:5500'); 


  // Handle any errors that occur.
  socket.onerror = function (error) {
    console.log('WebSocket Error: ' + error);
  };


  // Show a connected message when the WebSocket is opened.
  socket.onopen = function (event) {
    console.log("Socket is connected.");
  };


  // Handle messages sent by the server.
  socket.onmessage = function (event) {
    switch(event.data[messageType]) {
      case 'boardUpdate':
        testBoard=event.data['board'];
        drawMovement(event.data['board'])
        break
      //More to come with time
    }
  };


  // Show a disconnected message when the WebSocket is closed.
  socket.onclose = function (event) {
    console.log("Socket is disconnected");
  };


  


 //Send a signup request as soon as the socket is connected
 /*
 socket.send({
  "msgType": "signup",
  "sessionID": "1" //Change with time
})
*/


};
//window.onload();

//Main Loop
while (false) {
  break;
}


firstDraw(board);
//sleep(1000);
//drawMovement(boardTest);
//deleteTile(currentArray[3]);
//moveTile(currentArray[1],new Tile(12,4,currentArray[1].y,16,1,true))
//deleteTile(currentArray[3])
console.log(findposbyID(currentArray[3].id))
//(id,x,y,value,owner,enabled) Referece to Tile class for testing out the animation function