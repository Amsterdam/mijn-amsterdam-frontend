const express = require('express');
const setupProxy = require('../src/setupProxy');

const app = express();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 80;

// Use the same proxy as webpack-dev-server during development (npm start)
setupProxy(app);

app.use((req, res, next) => {
  if (req.url === '/') {
    req.url = '/index.html';
  }
  next();
});

app.use(express.static('build'));

app.listen(port, () => {
  console.log(`Now listening on ${host}:${port}`);
});
