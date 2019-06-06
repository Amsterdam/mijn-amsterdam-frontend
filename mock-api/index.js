const dyson = require('dyson');
const os = require('os');
const ifaces = os.networkInterfaces();

const options = {
  configDir: `${__dirname}/`,
  port: 5000,
};

// Get network ip for localhost
Object.keys(ifaces).forEach(function(ifname) {
  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (!exports.ip) {
      exports.ip = iface.address;
    }
  });
});

const configs = dyson.getConfigurations(options);
const appBefore = dyson.createServer(options);

appBefore.use((req, res, next) => {
  // Put your middleware here!
  next();
});

dyson.registerServices(appBefore, options, configs);

console.log(`Dyson listening on ${exports.ip}:${options.port}`);
