const ip = require('../get-ip').ip;

const [dir, port] = process.argv.slice(2);
const apiPort = process.env.MOCK_API_PORT || port || 5000;
const configDir = process.cwd() + '/' + dir;

console.log(
  `Dyson listening on ${ip}:${apiPort} and serving from: ${configDir}`
);

exports.ip = ip;
