const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const scookieSession = require('cookie-session');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

function handleLogin(req, res, next) {
  if (['/api/login', '/api1/login', '/mock-api/login'].includes(req.url)) {
    const userType = req.url.startsWith('/api1/') ? 'BEDRIJF' : 'BURGER';
    req.session = { isAuthenticated: true, userType };
  }
  next();
}

function handleLogout(req, res) {
  req.session = null;
  return res.redirect(`/`);
}

function handleUnauthorized(req, res, next) {
  if (!req.session.isAuthenticated && req.url !== '/auth/check') {
    res.status(403);
    return res.send('Unauthorized');
  }
  next();
}

function handleSession(req, res, next) {
  if (req.session.isAuthenticated) {
    // Prolongue session time
    const now = new Date().getTime();
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();
    req.session.validUntil = validUntil;
  }

  next();
}

module.exports = function(app) {
  app.set('trust proxy', 1);

  app.use(
    scookieSession({
      name: 'ma-test-session',
      keys: ['for', 'simple', 'testing'],
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
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
        if (req.session && req.session.isAuthenticated) {
          proxyReq.setHeader('x-session', JSON.stringify(req.session));
        }
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
