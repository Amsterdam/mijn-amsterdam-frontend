const args = process.argv.slice(2);

const PATH = args[0].split('=')[1];
const HOST = args[1].split('=')[1];

const post_data = {
  type: 'message',
  attachments: [
    {
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        type: 'AdaptiveCard',
        body: [
          {
            type: 'TextBlock',
            text: 'Message Text',
          },
        ],
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        version: '1.0',
      },
    },
  ],
};

const post_options = {
  host: HOST,
  port: 443,
  path: PATH,
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
      console.log('Node NOT Exiting...');
    });
    res.on('data', function (chunk) {
      console.log('Response: ' + chunk);
    });
  });

  post_req.write(post_data);
  post_req.end();
} catch (e) {
  console.error(e);
  console.log('Node NOT Exiting...');
}
