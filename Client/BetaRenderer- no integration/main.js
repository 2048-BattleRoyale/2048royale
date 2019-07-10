gridContainer=document.getElementById('grid');
gridContainer.style.transform="translate(1vmin,0vmin)"
for (index = 1; index < 14; index++) {
  var vertical_line = document.createElement('div');
  vertical_line.className='vline';
  vertical_line.id="vline"+index.toString();
  gridContainer.appendChild(vertical_line);  
  document.getElementById("vline"+index.toString()).style.transform = "translate("+( 5.78571428571*index).toString()+"vmin,"+(-80*(index-1)).toString()+"vmin)";
}
for (index = 1; index < 0; index++) {
  var horizontal_line = document.createElement('div');
  horizontal_line.className='hline';
  horizontal_line.id="hline"+index.toString();
  gridContainer.appendChild(horizontal_line);  
  document.getElementById("hline"+index.toString()).style.transform = "translate("+"0vmin,"+( 5.71428571429*index-1047).toString()+"vmin)";
}
/*
anime({
  targets: 'div.box',
  translateY: [
    { value: 200, duration: 500 },
    { value: 0, duration: 500 },
  ],
  rotate:{
    value: '.75turn',
    easing: 'easeInOutSine'
  },
  backgroundColor:[{
      value:'#FFF',
      easing: 'spring',
      duration:500
    },
  {
    value:'#9b00ff',
  }],
  delay: function(el, i, l){ return i * 500},
  loop:true,
  drection:'alternate'
  
});
*/