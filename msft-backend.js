// Microsoft Graph API Backend for Zipwhip Integration

// This Node server provides web services to interact with the Microsoft Graph API
// from a Zipwhip integration. It handles authentication to the Graph API's OAuth
// system. It also handles retrieving contacts for an account.

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var qs = require('querystring');

http.createServer(function(req, res) {

  var uri = url.parse(req.url).pathname;
  console.log("URL being requested:", uri);

  if (uri == "/") {

    handleHomePage(res, uri);
    
  }
  
}).listen(process.env.PORT);

var handleHomePage = function(res, uri) {
    
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    
    res.end("The entry page for this server is widget.html");
}