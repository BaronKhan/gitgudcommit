/**
 * Simple webserver with proxy to github.com. Used to bypass CORS for cloning.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "wasm": "application/wasm"
};

var requestCount = 0;

function onRequest(request, response) {
    let path = request.url.substring(1);

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

        requestCount++;
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
}

http.createServer(onRequest).listen(5000);