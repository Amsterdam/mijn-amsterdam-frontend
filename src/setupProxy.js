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

  req.session = {
    isAuthenticated: true,
    userType: isCommercialUser ? 'BEDRIJF' : 'BURGER',
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
  app.get(['/tma-sso'], (req, res) => {
    req.session.ssoRedirected = true;
    return res.redirect(`${REDIRECT_AFTER_LOGIN}/test-api/auth/check`);
  });
  app.get(['/test-api/login', '/test-api1/login'], handleLogin);
  app.use(['/test-api', '/test-api1'], handleSession);
  app.get(['/test-api/auth/check', '/test-api1/auth/check'], (req, res) => {
    if (
      !req.session.ssoRedirected &&
      ((req.session.userType === 'BURGER' && req.url.includes('api1/')) ||
        (req.session.userType === 'BEDRIJF' && !req.url.includes('api1/')))
    ) {
      return res.send(`<html><head><title>A-Select Filter Redirect</title>
<meta http-equiv="refresh" content="0;url=${REDIRECT_AFTER_LOGIN}/tma-sso?request=login1&a-select-server=tma.acc.amsterdam.nl&rid=RAC5A8D8755F8BA50458A4336E05BD75EF4990DC2">
<script language="javascript">top.location="${REDIRECT_AFTER_LOGIN}/tma-sso?request=login1&a-select-server=tma.acc.amsterdam.nl&rid=RAC5A8D8755F8BA50458A4336E05BD75EF4990DC2";</script>
</head><body></body></html>
`);
    }
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
          proxyReq.setHeader('x-user-type', req.session.userType);
        }
      },
    })
  );
};
