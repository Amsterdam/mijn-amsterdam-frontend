const express = require('express');
const setupProxy = require('../src/setupProxy');
const path = require('path');
const compression = require('compression');

const app = express();

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;

// Use the same proxy as webpack-dev-server during development (npm start)
setupProxy(app);
app.use(compression());
app.use(express.static('build'));

app.use((req, res) => {
  // Fallback to index
  res.sendFile(path.resolve(process.cwd(), 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Now listening on ${host}:${port}`);
});
