/**
 * Simulates an AIS server by continuously sending entries from an
 * NMEA text file to all connected clients.
 */
const net = require("net");
const fs = require("fs");
const stream = require("stream");
const split = require("split");
const minimist = require("minimist");
const debugLibrary = require("debug");

const debug = debugLibrary("airdash:fake-ais-server");
debugLibrary.enable("airdash:*");

// Global set of connected clients.
const CLIENTS = new Set();

// Parse a YYMMDDHHMMSS string to a Date.
const parseDate = (s) => {
  return new Date(
    s.replace(/^(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$4:$5:$6 $2/$3/20$1")
  );
};

// We support reading from two types of files: Plain logs
// of NMEA data (one message per line); and a custom format
// where each message is preceeded by a timestamp in
// the format YYMMDDHHMMSS, followed by a comma.
//
// This class implements Writable stream that auto detects timestamped
// messages, and implements a delay when it reads one.
//
// The main use of this "delay" facility is to replay timestamped logs
// in a way that simulates their real-world arrival rate. We naturally
// wouldn't want to spew a 1GB log to clients all at once...
class DelayedSender extends stream.Writable {
  TIMESTAMPED_MESSAGE_RE = /^(\d{12}),(.+)/;

  /**
   *
   * @param {function} sendFn The function to call when the next message is available
   * @param {number} defaultDelaySeconds The default amount to delay
   * @param {*} maxDelay The maximum amount to delay.
   */
  constructor(sendFn, defaultDelaySeconds = 0.5, maxDelay = 100) {
    super();
    this.sendFn = sendFn;
    this.defaultDelaySeconds = defaultDelaySeconds;
    this.maxDelay = maxDelay;
    this.lastTimestamp = null;
  }

  _write(chunk, enc, next) {
    let message = chunk;
    let timestamp = this.lastTimestamp;
    let delaySeconds = this.defaultDelaySeconds;
    const match = this.TIMESTAMPED_MESSAGE_RE.exec(chunk);

    if (match) {
      timestamp = parseDate(match[1]);
      message = match[2];
      delaySeconds = this.lastTimestamp ? (timestamp - this.lastTimestamp) / 1000 : 0;
      this.lastTimestamp = timestamp;
    }

    // Don't delay *too* much. I've arbitrarily decided that a default of
    // 100seconds is too long for our purposes (likely indicates a data bug).
    if (delaySeconds > 0 && delaySeconds < this.maxDelay) {
      // Send delayed.
      setTimeout(() => {
        try {
          this.sendFn(message);
        } finally {
          next();
        }
      }, delaySeconds * 1000);
    } else {
      // Send immediate.
      try {
        this.sendFn(message);
      } finally {
        next();
      }
    }
  }
}

const getSocketName = (socket) => {
  return JSON.stringify(socket.remoteAddress);
};

const removeClient = (socket) => {
  CLIENTS.delete(socket);
};

const sendLineToClients = (line) => {
  for (let c of CLIENTS) {
    try {
      c.write(line);
      c.write("\n");
    } catch (e) {
      debug(`Removing client due to error: ${e}`);
      removeClient(c);
    }
  }
};

const startStreamingFromFile = (filename) => {
  debug(`Streaming from file: ${filename}`);

  const dataStream = fs
    .createReadStream(filename)
    .pipe(split())
    .pipe(
      new DelayedSender((message) => {
        debug(`sending message: ${message}`);
        sendLineToClients(message);
      })
    )
    .on("finish", function () {
      debug(`Reached end of file ${filename}; restarting stream`);
      setTimeout(function () {
        startStreamingFromFile(filename);
      }, 0);
    });
  return dataStream;
};

const runServer = ({ port, dataFile }) => {
  startStreamingFromFile(dataFile);

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
