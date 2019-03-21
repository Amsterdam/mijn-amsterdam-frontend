// Start here dyson on port 5001
const dyson = require('dyson');

dyson.bootstrap({
  configDir: `${__dirname}/`,
  port: 5001,
});
