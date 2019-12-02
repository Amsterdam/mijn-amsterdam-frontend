const http = require('http');
const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '/../build/');
const mime = require('mime-types');

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

// // All urls that start with following paths are proxied
const proxiedPaths = ['/api', '/logout', '/atlas', '/mock-api'];
const httpProxy = require('http-proxy');

//
// Http Server with proxyRequest Handler and Latency
//
const proxy = new httpProxy.createProxyServer();

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
      const url = request.url.startsWith('/mock-api')
        ? request.url.replace(/(\/mock-api)/g, '/api')
        : request.url;

      request.url = url;

      proxy.on('error', error => {});

      proxy.web(request, response, {
        target: `http://${apiHost}:${apiPort}`,
      });
    }
  })
  .listen(port);
