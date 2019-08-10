
var testTheme={ //Default Theme- Change if other desired
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
  "16384":"cc66ff"
  }
var extraInfo={
  "gridBackground":"bbada0",
  "lineBorder":"776e65",
  "blocked":"eee4da",
  "darkColor":"776e65",
  "lightColor":"F9F6F2"
}

function changeJSON(number, color) {
  //console.log(color);
  testTheme[number.toString()]=color;
}
function changeJSON2(string, color) {
  switch(string) {
    case(1):
    extraInfo["gridBackground"]=color;
    break;
    case(2):
    extraInfo["lineBorder"]=color;
    break;
    case(3):
    extraInfo["blocked"]=color;
    break;
    case(4):
    extraInfo["darkColor"]=color;
    break;
    case(5):
    extraInfo["lightColor"]=color;
    break;

  }
}

$('.exportJSON').on('click', function(event) {
  $.cookie("colorTheme", JSON.stringify(testTheme));
  window.location.href = "index.html"; //Go home after setting the cookie

});
$('.export2JSON').on('click', function(event) {
  $.cookie("boardTheme", JSON.stringify(extraInfo));
  window.location.href = "index.html"; //Go home after setting the cookie
});

$('#title').on('click', function(event) {
  window.location.href = "index.html"; //Go home
  console.log('he')
});
