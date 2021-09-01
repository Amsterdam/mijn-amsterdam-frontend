const express = require('express');
const setupProxy = require('../src/setupProxy');
const path = require('path');
const compression = require('compression');

const app = express();

const nonce = '4AEemGb0xJptoIGFP3Nd';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Use the same proxy as webpack-dev-server during development (npm start)
setupProxy(app);
app.use(compression());
const cfg = `
  default-src 'self';
  connect-src 'self' https://*.data.amsterdam.nl https://api.usabilla.com https://sentry.data.amsterdam.nl https://siteimproveanalytics.com https://mijn-bff.amsterdam.nl https://acc.mijn-bff.amsterdam.nl https://api.swiftype.com;
  script-src 'self' https://analytics.data.amsterdam.nl https://*.usabilla.com http://*.usabilla.com https://siteimproveanalytics.com 'sha256-blLDIhKaPEZDhc4WD45BC7pZxW4WBRp7E5Ne1wC/vdw=' 'sha256-4+oZEPrU9EasYI748EYT+1B2DZCdZ19UGaX/gpLWwf4=' 'sha256-wZZTZ+IFA1sJKRjoJqzAI+c8330AH2nKu0Oznam9G7E=' 'sha256-z4OPXhHK/z0DCJWee4o7z7aQ9pnJBb4IEiBGGjUR7vg=' sha256-TyfshbRrF6wudNLAp2/kvGBI/xQXP3FMWE3hmehgmjQ=' 'sha256-A9Lbv51/Jy3uIZ6KaAWdfoDRNxbwCgEGxtXVY7qKF4A=' 'sha256-f0DbqYLskI35js3/QaFTvM/Z2ZUmer/HJW6Duud95k8=';
  img-src 'self' https://*.amsterdam.nl https://*.data.amsterdam.nl https://d6tizftlrpuof.cloudfront.net https://*.usabilla.com https://6004851.global.siteimproveanalytics.io data:;
  frame-src 'self' https://analytics.data.amsterdam.nl;
  style-src 'self' 'unsafe-hashes' https://fast.fonts.net https://d6tizftlrpuof.cloudfront.net 'nonce-${nonce}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-32t0bJPIyxns/QqsW8RE3JGUERKnHL5RygHBgJvEanc=' 'sha256-Z8ql5uoWyhH3XVFK2nG2JIPy0JUew33X/cELWehWR4A=' 'sha256-Yz3WVa4XD8fKk1TBfWFeJB50Hu3oNAqOITT6j+HP/bU=' 'sha256-wZZTZ+IFA1sJKRjoJqzAI+c8330AH2nKu0Oznam9G7E=' 'sha256-chVdzYfcS16n4LrShHQ68D1UQ4kaNvlNTrk9U8LotB8=' 'sha256-60Ytj0beJCJifpdQUv6f9B7nWDqJFAOl3JD93YK/ZHI=' 'sha256-P4Py+dtzN88J0dU5FdWseXYhd9tUo0/yyy3hpkzPSjc=';
  font-src 'self' https://d6tizftlrpuof.cloudfront.net;
  manifest-src 'self';
  object-src 'none';
  frame-ancestors 'self';
  `
  .replace(/\n/gi, '')
  .trim();

app.use(function (req, res, next) {
  res.setHeader('Content-Security-Policy', cfg);
  return next();
});

app.use(express.static('build'));

app.use((req, res) => {
  // Fallback to index

  res.sendFile(path.resolve(process.cwd(), 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Now listening on ${host}:${port}`);
});
