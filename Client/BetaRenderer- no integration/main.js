var gridContainer=document.getElementById('grid');
gridContainer.style.transform="translate(1vmin,0vmin)";
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
var animationDuration=500;
var lastStrokeTime;
var packetSent = false;
var playerAlive = true;
var currentArray=[];
var modernArray=[];
var currentTiles=[];

var board = {"Food":"Great","Players":{1:{"Name":"String","Score":0},2:{"Name":"String","Score":0},3:{"Name":"String","Score":4},4:{"Name":"String","Score":0}},"Boxes":{"box1":{"enabled":true,"tileNum":2,"tileID":0,"owner":1,"justMerged":false},"box2":{"enabled":true,"tileNum":4,"tileID":18,"owner":2,"justMerged":false},"box3":{"enabled":true,"tileNum":4,"tileID":96,"owner":1,"justMerged":false},"box4":{"enabled":true,"tileNum":4,"tileID":37,"owner":1,"justMerged":true}}};
//Tile class is the object that's stored in each array.
console.log(board.Boxes["box3"].tileID);
class Tile {
  constructor(id,x,y,value) {
    this.x=x;
    this.y=y;
    this.value=value;
    this.id=id;
  }

  deleteSelf() {
    alert("I need a frickin' array before I can delete tiles.");
  }

}

// Generate a test array for number manipulation

var extrarows=0;
for (let i=1;i<15;i++) {
  for (let j=0;j<14;j++) {
    currentArray.push(new Tile(14*(i-1)+j+extrarows,j,i,Math.pow(2,1+(Math.floor(Math.random() * 3)))));
  }
  extrarows+=1;
}
console.log(currentArray)
console.log(currentArray[1]); //Check to make sure IDs are still logical
//Primary Functions
function removeTile(removeid) {

}
function g2(x) {
  if (x>2) {
    return 1;
  }
  else {
    return 0;
  }
}
function newTile(Tile) {
    var tile_div=document.createElement('div');
    tile_div.className='tile';
    tile_div.id='tile'+(Tile.id).toString();
    grid.appendChild(tile_div);
   // document.getElementById('tile'+(Tile.id).toString()).style.transform="translate(1vmin,0vmin)" //Static transform to accomodate for the earlier margin one
    document.getElementById('tile'+(Tile.id).toString()).style.transform="translate("+(2.859+5.75*(Tile.x))+"vmin,"+((Tile.y-1)*5.75+1.859)+"vmin)" //Original position transform
    document.getElementById('tile'+(Tile.id).toString()).style.transform.backgroudColor=getColor(Tile.Value);
    
  }
function getColor(value) {

}
function moveSingular() {

}
function drawAtCoords(X,Y,Value) {

}
function firstDraw() {

}
function deleteTile() {

}
function drawMovement() {
  //Handle the corners, and make them fancy
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
}
for (i=0;i<(14*14);i++) {
  newTile(currentArray[i]);
}

//Listeners
document.addEventListener('keydown', function(event){
  //alert(event.keyCode); (Uncomment this line if you need to add future keyswitch codes)
  switch(event.keyCode) {
    case 87:
    case 38:
      alert("Up! To be replaced by sockets when ready.");
      break;
    case 39:
    case 68:
        alert("Right! To be replaced by sockets when ready.");
        break;
    case 40:
    case 83:
        alert("Down! To be replaced by sockets when ready.");
        break;
    case 37:
    case 65:
        alert("Left! To be replaced by sockets when ready.");
        break;

  }
} );




//Main Loop
while (false) {
  break;
}






 /* Uncomment for shenanigans
 
anime({
  targets: 'div.grid',
  translateY: [
    { value: 200, duration: 500 },
    { value: 0, duration: 500 },
    { value: 200, duration: 500 },
  ],
  rotate:{
    value: '.75turn',
    easing: 'easeInOutSine'
  },
  backgroundColor:[{
      value:'#2b01ff',
      easing: 'spring',
      duration:500
    },
  {
    value:'#9b00ff', duration:500
  }],
  delay:500,
  loop:true,
  direction:'alternate'
  
});
*/