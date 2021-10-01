const express = require('express');
const setupProxy = require('../src/setupProxy');
const path = require('path');
const compression = require('compression');
const fs = require('fs');

const app = express();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Use the same proxy as webpack-dev-server during development (npm start)
setupProxy(app);

let cfg = '';

fs.readFile(
  path.join(__dirname, '../', 'conf', 'nginx-server-default.template.conf'),
  'utf8',
  function (err, data) {
    if (err) {
      return console.log(err);
    }
    const matches = data
      .match(/(?:"[^"]*"|^[^"]*$)/)[0]
      .replace(/\n/gi, '')
      .trim();
    cfg = matches ? matches : data;
  }
);

app.use(compression());

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
