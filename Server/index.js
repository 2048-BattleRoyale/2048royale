var http = require('http');
var url = require('url');
var queryString = require('querystring');

// https://ilovecoding.org/courses/nodejs/lessons/create-a-simple-http-server-with-nodejs

http.createServer(function (request, response) {
  response.writeHead(200, {
    // 'Content-type': 'text/plain'
    'Content-type': 'text/html'
  });
  response.write('Hello Node JS Server Response');
  response.end();

  pathName = url.parse(request.url).pathname;
  query = url.parse(request.url).query;
  console.log('pathName: ' + pathName);
  console.log('query: ' + query);
}).listen(7000);