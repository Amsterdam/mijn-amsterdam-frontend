const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const scookieSession = require('cookie-session');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

function loginPage(req, res, next) {
  return res.sendFile(__dirname + '/client/public/tma-login-mock.html');
}

function handleLogin(req, res, next) {
  const userType = req.url.startsWith('/api1/') ? 'BEDRIJF' : 'BURGER';
  req.session = { isAuthenticated: true, userType };

  return res.redirect(`http://${host}:${port}`);
}

function handleLogout(req, res) {
  req.session = null;
  return res.redirect(`/`);
}

function handleSession(req, res, next) {
  if (req.session.isAuthenticated) {
    // Prolongue session time
    const now = new Date().getTime();
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();
    req.session.validUntil = validUntil;
    next();
  } else {
    res.status(403);
    return res.send('Unauthorized');
  }
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

  app.get('/logout', handleLogout);
  app.get(['/api/login'], loginPage);
  app.get(['/api/tma', '/api1/tma'], handleLogin);
  app.all('/api', handleSession);
  app.get('/api/auth/check', (req, res) => {
    return res.send(req.session);
  });

  app.use(
    ['/api'],
    createProxyMiddleware({
      target: `http://${apiHost}:${apiPort}`,
      changeOrigin: true,
    })
  );
};
