/**
 * Simulates an AIS server by continuously sending entries from an
 * NMEA text file to all connected clients.
 */
const net = require("net");
const fs = require("fs");
const minimist = require("minimist");
const debugLibrary = require("debug")

const debug = debugLibrary("airdash:fake-ais-server");
debugLibrary.enable("airdash:*");

// Wait this many millis before sending the next line.
const SEND_INTERVAL_MILLIS = 500;

const CLIENTS = new Set();

const getSocketName = (socket) => {
  return JSON.stringify(socket.remoteAddress);
};

const removeClient = (socket) => {
  CLIENTS.delete(socket);
};

const runServer = ({ port, dataFile }) => {
  const dataLines = fs
    .readFileSync(dataFile, "utf-8")
    .split("\n")
    .filter(Boolean);
  const numLines = dataLines.length;
  let currentLine = 0;

  const server = net.createServer(function (socket) {
    const socketName = getSocketName(socket);
    socket.on("close", () => {
      debug(`<--- Removing client due to close: ${socketName} ...`);
      removeClient(socket);
    });
    socket.on("error", () => {
      debug(`<--- Removing client due to error: ${socketName} ...`);
      removeClient(socket);
    });
    debug(`---> Adding client: ${socketName} ...`);
    CLIENTS.add(socket);
  });
  server.listen(port, "0.0.0.0");

  const sendNextLine = () => {
    const nextLine = dataLines[currentLine];
    currentLine = (currentLine + 1) % numLines;
    for (let c of CLIENTS) {
      try {
        c.write(nextLine);
        c.write("\n");
      } catch (e) {
        debug(`Removing client due to error: ${c}`);
        removeClient(c);
      }
    }
  };

  setInterval(sendNextLine, SEND_INTERVAL_MILLIS);
};

const usage = () => {
  console.error(`Usage: ${process.argv[1]} --port=<port> --file=<file>`);
};

const run = () => {
  const argv = minimist(process.argv.slice(2));
  const config = {
    port: Number.parseInt(argv.port, 10) || 10111,
    dataFile: argv.file,
  };

  if (!config.port || !config.dataFile) {
    usage();
    process.exit(1);
  }

  debug(`Running server, config: ${JSON.stringify(config)}`);
  runServer(config);
};

run();
