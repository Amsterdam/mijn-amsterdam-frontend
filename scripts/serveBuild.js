const express = require('express');
const setupProxy = require('../src/setupProxy');
const path = require('path');
const compression = require('compression');

const app = express();

const nonce = '135354q646w34';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Use the same proxy as webpack-dev-server during development (npm start)
setupProxy(app);

app.use(compression());
const cfg = `
  default-src 'self';
  connect-src 'self' https://*.data.amsterdam.nl https://api.usabilla.com https://sentry.data.amsterdam.nl https://siteimproveanalytics.com https://mijn-bff.amsterdam.nl https://acc.mijn-bff.amsterdam.nl https://api.swiftype.com;
  script-src 'self' https://analytics.data.amsterdam.nl https://*.usabilla.com http://*.usabilla.com https://siteimproveanalytics.com 'sha256-blLDIhKaPEZDhc4WD45BC7pZxW4WBRp7E5Ne1wC/vdw=' 'sha256-4+oZEPrU9EasYI748EYT+1B2DZCdZ19UGaX/gpLWwf4=' 'sha256-Xib5wPV12ObyhP8owkIHR4ZZQmnArcGwGcTr85OQMPU=' 'sha256-zzi85gFPuVzcEknzTfNOUoTO6d/qSDQGHaYNtb/BY2s=' 'sha256-Xm34o1w+N1+JNGfkOTmwBPFrYjiT6DJUi87puk6no80=' 'sha256-1vg5ofkMvbXG8aFP32TYh7Gck1AlSS0V38GhNmppeaE=' 'sha256-ep3oiLGxFdt6jfccmEOQy2CRvoKoU2IivgQfR3F33jc=' 'sha256-BjaxcQ1i9KoFSd9G8rDaO3pC1lB30TTZZc6xG2Mnhfw=' 'sha256-iurH4CAMmwZT5En4JPQFDFIfF4X8Sp/bmHaWMs86uXE=' 'sha256-xRXGBXyMD2ZRDAoQFQQUxNQZ/z+XCsf2RAuSlyZ64Mk=';
  img-src 'self' https://*.amsterdam.nl https://*.data.amsterdam.nl https://d6tizftlrpuof.cloudfront.net https://*.usabilla.com https://6004851.global.siteimproveanalytics.io data:;
  frame-src 'self' https://analytics.data.amsterdam.nl;
  style-src 'self' 'unsafe-hashes' https://fast.fonts.net https://d6tizftlrpuof.cloudfront.net 'nonce-${nonce}';
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
