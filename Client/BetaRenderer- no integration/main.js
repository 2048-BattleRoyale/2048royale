gridContainer=document.getElementById('grid');
gridContainer.style.transform="translate(1vmin,0vmin)"
//Draw those snazzy vertical lines
for (index = 1; index < 14; index++) {
  var vertical_line = document.createElement('div');
  vertical_line.className='vline';
  vertical_line.id="vline"+index.toString();
  gridContainer.appendChild(vertical_line);  
  document.getElementById("vline"+index.toString()).style.transform = "translate("+( 5.8*index).toString()+"vmin,"+(0).toString()+"vmin)";
}
//Draw some snazzier horizontal lines
for (index = 1; index < 14; index++) {
  var horizontal_line = document.createElement('div');
  horizontal_line.className='hline';
  horizontal_line.id="hline"+index.toString();
  gridContainer.appendChild(horizontal_line);  
  document.getElementById("hline"+index.toString()).style.transform = "translate("+(0).toString()+"vmin,"+(5.8*index).toString()+"vmin)";
}
//Variable&Class Declarations

var userToken = "PLACEHOLDER";
var score = 0;
var animationDuration=500;
var lastStrokeTime;
var packetSent = false;
var playerAlive = true;
var currentArray=[];
var modernArray=[];
var currentTiles=[];

//Tile class is the object that's stored in each array.
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

for (let i=0;i<14;i++) {
  for (let j=0;j<14;j++) {
    currentArray.push(new Tile(14*i+j,j,i,Math.pow(2,1+(Math.floor(Math.random() * 3)))));
  }
}

console.log(currentArray[16]); //Check to make sure IDs are still logical
//Primary Functions
function removeTile(removeid) {

}
function newTile(newX, newY,value) {

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