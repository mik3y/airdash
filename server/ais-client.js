const net = require("net");
const AisDecoder = require("ais-stream-decoder").default;
const split = require("split");
const SerialPort = require("serialport");
const debugLibrary = require("debug");

const STATUS_DISCONNECTED = "disconnected";
const STATUS_CONNECTING = "connecting";
const STATUS_RECONNECTING = "reconnecting";
const STATUS_CONNECTED = "connected";

const RECONNECT_TIMEOUT = 5000;

const PROTOCOL_AIS_TCP = "ais-tcp:";
const PROTOCOL_AIS_SERIAL = "ais-serial:";

const debug = debugLibrary("airdash:AISClient");

/**
 * A client for an AIS NMEA data stream.
 *
 * This client supports reading from two kinds of streams: A TCP socket, or
 * a serial port. The type of stream it reads from is specified by the URL
 * provided to the constructor.
 */
class AISClient {
  /**
   * Constructor.
   *
   * @param {string} urlString The source to connect to
   * @param {function} onMessage Callback that fires with a newly-received message
   */
  constructor(urlString, onMessage) {
    this.url = new URL(urlString);
    this.onMessage = onMessage;

    this.status = STATUS_DISCONNECTED;

    this.fd = null;
    this.reconnectTimeout = null;
  }

  connect() {
    if (
      this.status !== STATUS_DISCONNECTED &&
      this.status !== STATUS_RECONNECTING
    ) {
      throw new Error(`Cannot connect: already in state ${this.status}`);
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.status = STATUS_CONNECTING;

    switch (this.url.protocol) {
      case PROTOCOL_AIS_TCP:
        return this._connectTcp();
      case PROTOCOL_AIS_SERIAL:
        return this._connectSerial();
      default:
        throw new Error(`Unknown AIS url: ${this.url}`);
    }
  }

  _connectTcp() {
    this.fd = new net.Socket();
    this.fd.on("close", () => {
      this._handleDisconnect();
    });

    this.fd.on("error", (err) => {
      this._handleError(err);
    });

    debug(
      `Opening TCP connection to ${this.url.hostname}:${this.url.port} ...`
    );

    this.fd.connect(this.url.port, this.url.hostname, () => this._startPipeline());
  }

  _connectSerial() {
    const options = {};
    if (this.url.searchParams.baud) {
      options.baudRate = Number.parseInt(this.url.searchParams.baud, 10);
    }
    const filename = this.url.pathname;

    debug(`Opening serial connection on ${filename} options=${JSON.stringify(options)} ...`);

    this.fd = new SerialPort(this.url.pathname, options);

    this.fd.on("error", (err) => {
      this._handleError(err);
    });

    this._startPipeline();
  }

  _startPipeline() {
    debug('Starting decoding pipeline ...');
    this.status = STATUS_CONNECTED;
    const aisDecoder = new AisDecoder({ silent: true });
    this.fd
      .pipe(split())
      .pipe(aisDecoder)
      .on("data", (decodedMessage) => {
        this.onMessage(JSON.parse(decodedMessage));
      });
  }

  disconnect() {
    if (!this.fd) {
      return;
    }
    this.fd.destroy();
    this.status = STATUS_DISCONNECTED;
  }

  _handleDisconnect() {
    if (
      this.status !== STATUS_DISCONNECTED &&
      this.status !== STATUS_RECONNECTING
    ) {
      debug(`Got disconnected, scheduling reconnect`);
      this._scheduleReconnect();
    }
  }

  _handleError(err) {
    debug(`Got error: ${err}`);
    if (
      this.status !== STATUS_DISCONNECTED &&
      this.status !== STATUS_RECONNECTING
    ) {
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }
    debug(`Scheduling reconnect for ${RECONNECT_TIMEOUT}ms from now ...`);
    this.status = STATUS_RECONNECTING;
    this.reconnectTimeout = setTimeout(() => this.connect(), RECONNECT_TIMEOUT);
  }
}

// Export some constants for others.
AISClient.PROTOCOL_AIS_SERIAL = PROTOCOL_AIS_SERIAL;
AISClient.PROTOCOL_AIS_TCP = PROTOCOL_AIS_TCP;

module.exports = AISClient;
