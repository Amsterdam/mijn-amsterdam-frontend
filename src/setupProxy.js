const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const session = require('express-session');

const host = process.env.APP_HOST || 'localhost';
const port = process.env.APP_PORT || 3000;

const apiHost = process.env.MOCK_API_HOST || 'localhost';
const apiPort = process.env.MOCK_API_PORT || 5000;

const SESSION_MAX_AGE = 150 * 1000; //15 * 60 * 1000; // 15 minutes

// function loginPage(req, res, next) {
//   if (!req.cookies[COOKIE_NAME]) {
//     if (req.headers['x-userType'] === 'BEDRIJF') {
//       return res.send('EHERKENNING');
//     } else {
//       const randomUserName = 'timmeh';
//       return res.send(
//         '<form action="/api/login" method="post"><input type="text" name="username" value="' +
//           randomUserName +
//           '"><button type="submit">login</button></form>'
//       );
//     }
//   }
//   next();
// }

function handleLogin(req, res, next) {
  if (!req.session.user && ['/api/login', '/api1/login'].includes(req.url)) {
    const userType = req.url.startsWith('/api1/') ? 'BEDRIJF' : 'BURGER';
    req.session.user = { isAuthenticated: true, userType };
  }
  next();
}

function handleLogout(req, res) {
  req.session.destroy();
  return res.redirect(`http://${host}:${port}`);
}

function handleSession(req, res, next) {
  const now = new Date().getTime();
  // Request is made outside session time
  if (
    req.session.user &&
    req.session.user.validUntil &&
    req.session.user.validUntil < now
  ) {
    req.session.destroy();
  }

  if (req.session.user) {
    // Prolongue session time
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();
    req.session.user.validUntil = validUntil;
  }

  next();
}

function handleUnauthorized(req, res, next) {
  if (!req.session.user && req.url !== '/auth/check') {
    res.status(403);
    return res.send('Unauthorized');
  }
  next();
}

module.exports = function(app) {
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      // cookie: { secure: true, httpOnly: true },
      // rolling: true,
    })
  );
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true,
    })
  );
  // app.get(['/api/login', '/api1/login'], loginPage);
  app.use(['/logout'], handleLogout);
  app.use(handleLogin);
  app.use(['/api', '/api1'], handleUnauthorized);
  app.use(handleSession);
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
        '/api1': '/api',
      },
      router: {
        '/api/login': `http://${host}:${port}`,
        '/api1/login': `http://${host}:${port}`,
      },
    })
  );
};
