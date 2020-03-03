const dyson = require('dyson');
const compression = require('compression');

const options = {
  configDir: __dirname,
  port: process.env.MOCK_API_PORT || 5000,
};

const configs = dyson.getConfigurations(options);
const appBefore = dyson.createServer(options);

appBefore.use(compression());
appBefore.use((req, res, next) => {
  console.log('jajjajajajjaja');
  next();
});

// Start the server
dyson.registerServices(appBefore, options, configs);

console.log(`Dyson listening at port ${options.port}`);
