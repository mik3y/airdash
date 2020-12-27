const minimist = require("minimist");
const AISClient = require("../server/ais-client");
const debugLibrary = require("debug")
debugLibrary.enable("airdash:*");

const debug = debugLibrary("airdash:ais-client");

const runClient = ({ hostname, port }) => {
  const client = new AISClient(hostname, port, (message) => {
    debug(`Got message: ${message}`);
  });
  client.connect();
};

const usage = () => {
  console.error(`Usage: ${process.argv[1]} host:port`);
};

const run = () => {
  const argv = minimist(process.argv.slice(2));
  if (!argv._ || !argv._.length) {
      usage();
      process.exit(1);
  }
  const hostString = argv._[0];
  const [hostname, port] = hostString.split(':');
  runClient({ hostname, port })
};

run();
