const { createProxyMiddleware } = require('http-proxy-middleware');

// host + port for proxy target
const apiHost = process.env.BFF_HOST || 'localhost';
const apiPort = process.env.BFF_PORT || 5000;

module.exports = function (app) {
  app.set('trust proxy', 1);

  app.use(
    ['/test-api', '/test-api1', '/test-api2', '/logout'],
    createProxyMiddleware({
      target: `http://${apiHost}:${apiPort}`,
      changeOrigin: true,
      pathRewrite: {
        '/test-api/': '/',
        '/test-api1/': '/',
        '/test-api2/': '/',
      },
    })
  );
};
