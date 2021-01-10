const minimist = require("minimist");
const AISClient = require("../server/ais-client");
const debugLibrary = require("debug")
debugLibrary.enable("airdash:*");

const debug = debugLibrary("airdash:ais-client");

const runClient = (url) => {
  const client = new AISClient(url, (message) => {
    debug(`Got message: ${JSON.stringify(message)}`);
  });
  client.connect();
};

const usage = () => {
  console.error(`Usage: ${process.argv[1]} <url>`);
  console.error('');
  console.error('Examples:');
  console.error(`  ${process.argv[1]} ais-tcp://localhost:10111`);
  console.error(`  ${process.argv[1]} ais-serial:///dev/ttyS0`);
};

const run = () => {
  const argv = minimist(process.argv.slice(2));
  if (!argv._ || !argv._.length) {
      usage();
      process.exit(1);
  }
  const urlString = argv._[0];
  runClient(urlString);
};

run();
