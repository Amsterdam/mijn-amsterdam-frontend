const args = process.argv.slice(2);

const WEBHOOK = args[0].split('=')[1];
const HOST = args[1].split('=')[1];

console.log(HOST, WEBHOOK);
