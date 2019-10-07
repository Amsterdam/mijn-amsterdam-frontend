const http = require('http');
const fs = require('fs');
const path = require('path');
const ip = require('./get-ip').ip;
const appPath = path.join(__dirname, '/build/');
const port = process.env.APP_PORT || 3000;

http
  .createServer(function(request, response) {
    if (
      !request.url.startsWith('/api') &&
      !request.url.startsWith('/logout') &&
      !request.url.startsWith('/atlas')
    ) {
      let fileName = request.url;
      if (fileName.indexOf('.') === -1) {
        fileName = 'index.html';
      }
      var stream = fs.createReadStream(path.join(appPath, fileName));
      stream.on('error', function() {
        response.writeHead(404);
        response.end();
      });
      stream.pipe(response);
    } else {
      const [host] = request.headers['host'].split(':');
      console.log('route:', request.url);
      var request_options = {
        host: process.env.MOCK_API_HOST || ip,
        port: process.env.MOCK_API_PORT || 5000,
        path: request.url,
        method: request.method,
      };

      var proxy_request = http.request(request_options, function(
        proxy_response
      ) {
        proxy_response.pipe(response);
        var responseCache = '';
        proxy_response.on('data', function(chunk) {});
        response.writeHead(proxy_response.statusCode, proxy_response.headers);
      });
      request.pipe(proxy_request);
    }
  })
  .listen(port, () => {
    console.log(`Application server on ${ip}:${port}`);
    // startDyson();
  });
