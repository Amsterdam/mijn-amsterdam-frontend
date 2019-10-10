const os = require('os');
const ifaces = os.networkInterfaces();

// Get network ip for localhost
Object.keys(ifaces).forEach(function(ifname) {
  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (!exports.ip) {
      module.exports = iface.address;
    }
  });
});
