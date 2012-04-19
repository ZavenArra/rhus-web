var http = require('http');
var httpProxy = require('http-proxy');
var fs = require('fs');
var path = require('path');
var cgi = require('cgi');

var tilecache = http.createServer(
  cgi('tilecache-2.11/tilecache.cgi')
).listen(6078);


var tileProxy = new httpProxy.HttpProxy({
  target: {
    host: 'localhost', 
    port: 6078
  }
});
 


var proxy = new httpProxy.HttpProxy({
  target: {
    host: 'localhost', 
    port: 5984

  }
});
 
http.createServer(function (request, response) {
 
    console.log('request starting...');

    console.log(request.url);
    if(request.url.indexOf('/couchdb') == 0
       && request.method == 'GET' ){
      //proxy this request to couchdb
      request.url = request.url.replace('couchdb/','');
      proxy.proxyRequest(request, response);
      return;
    }


    if(request.url.indexOf('/tilecache-2.11/tilecache.cgi') == 0){
      request.url = request.url.replace('tilecache-2.11/','');
      tileProxy.proxyRequest(request, response);
      return;
    }
     
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.htm';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end('404: File not found');
        }
    });
     
}).listen(8080);
 
console.log('Server running at http://127.0.0.1:80/');
