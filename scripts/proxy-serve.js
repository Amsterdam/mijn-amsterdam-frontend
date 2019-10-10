const http = require('http');
const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '/../build/');

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

// All urls that start with following paths are proxied
const proxiedPaths = ['/api', '/logout', '/atlas'];

http
  .createServer(function(request, response) {
    console.log(`Request made to ${request.url}`);

    if (!proxiedPaths.some(path => request.url.startsWith(path))) {
      let fileName = request.url;
      if (fileName.indexOf('.') === -1) {
        fileName = 'index.html';
      }
      const stream = fs.createReadStream(path.join(appPath, fileName));
      stream.on('error', function() {
        response.writeHead(404);
        response.end();
      });
      stream.pipe(response);
    } else {
      const request_options = {
        host: apiHost,
        port: apiPort,
        path: request.url,
        method: request.method,
      };

      const proxy_request = http.request(request_options, function(
        proxy_response
      ) {
        proxy_response.pipe(response);
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
      });
      request.pipe(proxy_request);
    }
  })
  .listen(port, () => {
    console.log(
      `Application server running on ${host}:${port} with ${proxiedPaths} proxied to ${apiHost}:${apiPort}`
    );
  });
