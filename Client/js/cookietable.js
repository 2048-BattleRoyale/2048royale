
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
  "16384":"FFFFFF"
  }

function changeJSON(number, color) {
  //console.log(color);
  testTheme[number.toString()]=color;
}
$('.exportJSON').on('click', function(event) {
  $.cookie("colorTheme", JSON.stringify(testTheme));
  window.location.href = "index.html"; //Go home after setting the cookie

});
$('#title').on('click', function(event) {
  window.location.href = "index.html"; //Go home
  console.log('he')
});
