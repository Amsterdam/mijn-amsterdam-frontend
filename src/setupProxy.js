const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const scookieSession = require('cookie-session');

// host + port for proxy only used on Test server and E2e tests
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

const REDIRECT_AFTER_LOGIN =
  process.env.REDIRECT_AFTER_LOGIN || `http://${host}:${port}`;

// host + port for proxy target
const apiHost = process.env.BFF_HOST || 'localhost';
const apiPort = process.env.BFF_PORT || 5000;

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

function handleLogin(req, res, next) {
  const isCommercialUser = req.url.includes('/test-api1/');
  const redirectUrlAfterLogin = `${REDIRECT_AFTER_LOGIN}/${
    isCommercialUser ? 'test-api1-login' : 'test-api-login'
  }`;

  const userType = isCommercialUser ? 'BEDRIJF' : 'BURGER';

  console.log(
    'r:',
    req.session && req.session.isAuthenticated,
    req.session && req.session.userType,
    {
      isAuthenticated: true,
      userType,
    }
  );

  req.session = {
    isAuthenticated: true,
    userType,
  };

  return res.redirect(redirectUrlAfterLogin);
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

  app.get(['/logout'], handleLogout);
  app.get(['/test-api/login', '/test-api1/login'], handleLogin);
  app.use(['/test-api', '/test-api1'], handleSession);
  app.get(['/test-api/auth/check', '/test-api1/auth/check'], (req, res) => {
    return res.send(req.session);
  });

  app.use(
    ['/test-api', '/test-api1'],
    createProxyMiddleware({
      target: `http://${apiHost}:${apiPort}`,
      changeOrigin: true,
      pathRewrite: {
        '/test-api1': '/test-api',
      },
      onProxyReq: function onProxyReq(proxyReq, req, res) {
        proxyReq.setHeader('x-saml-attribute-token1', 'foobar');
        if (req.session.userType) {
          console.log('proxy request user type', req.session.userType);
          proxyReq.setHeader('x-user-type', req.session.userType);
        }
      },
    })
  );
};
