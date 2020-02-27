const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const session = require('express-session');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

function handleLogin(req, res, next) {
  if (
    !req.session.user &&
    ['/api/login', '/api1/login', '/mock-api/login'].includes(req.url)
  ) {
    const userType = req.url.startsWith('/api1/') ? 'BEDRIJF' : 'BURGER';
    req.session.user = { isAuthenticated: true, userType };
    req.session.cookie.maxAge = SESSION_MAX_AGE;
  }
  next();
}

function handleLogout(req, res) {
  req.session.destroy();
  return res.redirect(`/`);
}

function handleUnauthorized(req, res, next) {
  if (
    (!req.session.user || !req.session.user.isAuthenticated) &&
    req.url !== '/auth/check'
  ) {
    res.status(403);
    return res.send('Unauthorized');
  }
  next();
}

function handleSession(req, res, next) {
  if (req.session.user && req.session.user.isAuthenticated) {
    // Prolongue session time
    const now = new Date().getTime();
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();
    req.session.user.validUntil = validUntil;
  }

  next();
}

module.exports = function(app) {
  app.set('trust proxy', 1);

  app.use(
    session({
      secret: 'some-secret-huh',
      saveUninitialized: false,
      rolling: true,
      unset: 'destroy',
    })
  );
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true,
    })
  );
  app.use(['/logout'], handleLogout);
  app.use(handleLogin);
  app.use(['/api', '/api1', '/mock-api'], handleUnauthorized);
  app.use(['/api', '/api1', '/mock-api'], handleSession);
  app.use(
    ['/api', '/api1', '/mock-api'],
    createProxyMiddleware({
      target: `http://${apiHost}:${apiPort}`,
      changeOrigin: true,
      onProxyReq(proxyReq, req) {
        proxyReq.setHeader(
          'x-session',
          JSON.stringify(
            req.session && req.session.user ? req.session.user : null
          )
        );
      },
      pathRewrite: {
        '/mock-api': '/api',
        '/api/login': `/`,
        '/api1/login': `/`,
        '/mock-api/login': `/`,
        '/api1': '/api',
      },
      router: {
        '/api/login': `http://${host}:${port}`,
        '/api1/login': `http://${host}:${port}`,
        '/mock-api/login': `http://${host}:${port}`,
      },
    })
  );
};
