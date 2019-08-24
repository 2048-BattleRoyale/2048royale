function handleBox(number) {
  // Get references to elements on the page.
  var form = document.getElementById('message-form' + number);
  var msgField = document.getElementById('message' + number);
  var msgHistory = document.getElementById('messages' + number);
  var status = document.getElementById('status' + number);
  var closeBtn = document.getElementById('close' + number);

  // Create a new WebSocket.
  // var socket = new WebSocket('ws://echo.websocket.org');
  var sck = new WebSocket('ws://127.0.0.1:8000');

  // Handle any errors that occur.
  sck.onerror = function (error) {
    console.log('WebSocket Error: ' + error);
  };

  // Show a connected message when the WebSocket is opened.
  sck.onopen = function (event) {
    status.innerHTML = 'Connected to: ' + event.currentTarget.URL;
    status.className = 'open';
  };

  // Handle messages sent by the server.
  sck.onmessage = function (event) {
    var message = event.data;
    msgHistory.innerHTML += '<li class="received"><span>Received:</span>' +
      message + '</li>';
  };

  // Show a disconnected message when the WebSocket is closed.
  sck.onclose = function (event) {
    status.innerHTML = 'Disconnected from WebSocket.';
    status.className = 'closed';
  };

  // Send a message when the form is submitted.
  form.onsubmit = function (e) {
    e.preventDefault();

    // Retrieve the message from the textarea.
    var message = msgField.value;
    // Send the message through the WebSocket.
    sck.send(message);
    // Add the message to the messages list.
    msgHistory.innerHTML += '<li class="sent"><span>Sent:</span>' + message +
      '</li>';

    // Clear out the message field.
    msgField.value = '';
    return false;
  };

  // Close the WebSocket connection when the close button is clicked.
  closeBtn.onclick = function (e) {
    e.preventDefault();

    // Close the WebSocket.
    sck.close();
    return false;
  };
};

window.onload = function () {
  handleBox(1);
  handleBox(2);
  handleBox(3);
  handleBox(4);
}

loadSignupMsgsBtn = document.getElementById("loadSignupMsgs");
loadSignupMsgsBtn.onclick = function (event) {
  var box1 = document.getElementById('message' + 1);
  var box2 = document.getElementById('message' + 2);
  var box3 = document.getElementById('message' + 3);
  var box4 = document.getElementById('message' + 4);

  box1.value = JSON.stringify({
    msgType: "signup",
    sessionID: "bazb7aMs",
    name: "Billy Bob"
  });
  box2.value = JSON.stringify({
    msgType: "signup",
    sessionID: "bazb7afs",
    name: "Jane Bob"
  });
  box3.value = JSON.stringify({
    msgType: "signup",
    sessionID: "bazb3aMs",
    name: "Joe Smith"
  });
  box4.value = JSON.stringify({
    msgType: "signup",
    sessionID: "bwrb3aMs",
    name: "Jack Sprat"
  });
};

sendAllMsgsBtn = document.getElementById("sendAllMsgs");
sendAllMsgsBtn.onclick = function (event) {
  document.getElementById("submit" + 1).click();
  document.getElementById("submit" + 2).click();
  document.getElementById("submit" + 3).click();
  document.getElementById("submit" + 4).click();
}
