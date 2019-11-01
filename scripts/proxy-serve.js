const http = require('http');
const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '/../build/');
const mime = require('mime-types');

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

// All urls that start with following paths are proxied
const proxiedPaths = ['/api', '/logout', '/atlas', '/mock-api'];

http
  .createServer(function(request, response) {
    console.log(`Request made to ${request.url}`);

    if (!proxiedPaths.some(path => request.url.startsWith(path))) {
      let fileName = request.url;
      if (fileName.indexOf('.') === -1) {
        fileName = 'index.html';
      }
      const file = path.join(appPath, fileName);
      const stream = fs.createReadStream(file);

      stream.on('error', function() {
        response.writeHead(404);
        response.end();
      });

      response.setHeader(
        'Content-Type',
        mime.contentType(path.extname(fileName))
      );

      stream.pipe(response);
    } else {
      const path = request.url.startsWith('/mock-api')
        ? request.url.replace(/(\/mock-api)/g, '/api')
        : request.url;

      const request_options = {
        host: apiHost,
        port: apiPort,
        path,
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
