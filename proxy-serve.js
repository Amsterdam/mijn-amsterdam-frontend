module.paths.push('/usr/local/lib/node_modules');
const cypress = require('cypress');
const dyson = require('dyson');
const http = require('http');
const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '/build/');

// function startCypress() {
//   cypress
//     .open({
//       // reporter: 'junit',
//       record: false,
//       // browser: 'chrome',
//       config: {
//         baseUrl: `http://localhost:3000`,
//         chromeWebSecurity: false,
//         video: false,
//         // screenshotOnRunFailure: false,
//         viewportWidth: 1500,
//         viewportHeight: 1000,
//       },
//     })
//     .then(rs => {
//       const exitCode = rs.totalFailed >= 1 ? 1 : 0;
//       process.exit(exitCode);
//     })
//     .catch(error => {
//       console.error(error);
//       process.exit(1);
//     });
// }

// function startHttpServer() {
http
  .createServer(function(request, response) {
    if (!request.url.startsWith('/api') && !request.url.startsWith('/logout')) {
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

      var request_options = {
        host,
        port: 5000,
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
  .listen(3000, () => {
    console.log('Application server on port 3000');
    // startCypress();
  });
// }

// function startDyson() {
//   const options = {
//     configDir: path.join(__dirname, 'mock-api'),
//     port: 5000,
//   };

//   const configs = dyson.getConfigurations(options);
//   const appBefore = dyson.createServer(options);
//   const appAfter = dyson.registerServices(appBefore, options, configs);

//   console.log(`Dyson listening at port ${options.port}`);

//   startHttpServer();
// }

// startDyson();

// startCypress();

// async function startMockServer() {
//   return exec('npx dyson mock-api 5000', (err, stdout) => {
//     console.log(stdout);
//     console.log('over', err);
//   });
// }

// async function startTesting() {
//   return exec('npx cypress run', (err, stdout) => {
//     console.log(stdout);
//     console.log('over', err);
//   });
// }

// function killAllNode() {
//   exec('killall node');
// }

// async function start() {
//   console.log('start server');
//   startHttpServer();
// }

// start();
