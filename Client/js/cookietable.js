
var testTheme={ 
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

function changeJSON(number, color) {
  //console.log(color);
  testTheme[number.toString()]=color;
}
$('.exportJSON').on('click', function(event) {
  $.cookie("colorTheme", JSON.stringify(testTheme));

});
$('#title').on('click', function(event) {
  window.location.href = "index.html";
  console.log('he')
});
