var http = require('http');

http.createServer(function (request, response) {
  response.writeHead(200, {
    // 'Content-type': 'text/plain'
    'Content-type': 'text/html'
  });
  response.write('Hello Node JS Server Response');
  response.end();
}).listen(7000);