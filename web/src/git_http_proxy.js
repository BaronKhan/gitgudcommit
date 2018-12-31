/**
 * Simple webserver with proxy to github.com. Used to bypass CORS for cloning.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const mimeTypes = {
  "html": "text/html",
  "js": "text/javascript",
  "css": "text/css",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "gif": "image/gif",
  "wasm": "application/wasm"
};

// Maximum 10 requests every minute; else activate circuit breaker
const requestLimit = 10*20;
const requestBreakTime = 60*1000;

var requestCount = 0;

function onRequest(request, response) {
  let path = request.url.substring(1);

  if (requestCount > requestLimit) {
    response.statusCode = 503;
    response.end('');
    console.log("Circuit breaker is active. Ignoring request for "+request.url);
  } else {

    if(path.indexOf('/') > -1) {
      const options = {
        hostname: 'github.com',
        port: 443,
        path: request.url,
        method: request.method
      };

      console.log(`Proxying ${options.method} request to ${options.hostname} with path ${options.path}`);
      const proxy = https.request(options, function (res) {
        res.pipe(response, {
        end: true
        });
      });

      request.pipe(proxy, {
        end: true
      });

    } else {
      if(path === '') {
        path = 'index.html';
      }

      var mimeType = mimeTypes[path.split('.').pop()];
      
      if (!mimeType) {
        mimeType = 'text/plain';
      }

      response.writeHead(200, { "Content-Type": mimeType });

      if(fs.existsSync(path)) {
        response.end(fs.readFileSync(path));
      } else {
        response.statusCode = 404;
        response.end('');
      }
    }

    requestCount++;
    setTimeout(function() {
      if (requestCount > requestLimit)
        console.log("Deactivating circuit breaker");
      requestCount=0;
    }, requestBreakTime);
  }
}

http.createServer(onRequest).listen(5000);
