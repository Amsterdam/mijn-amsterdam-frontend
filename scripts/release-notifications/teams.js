const https = require('https');

function sendTeamsMessage(cardJson, host, path) {
  const post_data = JSON.stringify({
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: cardJson,
      },
    ],
  });

  const post_options = {
    host,
    port: 443,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data),
      'User-Agent': 'nodejs',
    },
  };

  try {
    // Set up the request
    const post_req = https.request(post_options, function (res) {
      res.setEncoding('utf8');
      res.on('error', function (err) {
        console.error(err.stack);
        process.exit();
      });
      res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
      });
    });

    post_req.write(post_data);
    post_req.end();
  } catch (e) {
    console.error(e);
    process.exit();
  }
}

module.exports = {
  sendTeamsMessage,
};
