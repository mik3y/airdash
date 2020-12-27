/**
 * Implements an AIS client.
 */

const net = require("net");
const AisDecoder = require("ais-stream-decoder").default;
const split = require("split");
const debugLibrary = require("debug");

const STATUS_DISCONNECTED = "disconnected";
const STATUS_CONNECTING = "connecting";
const STATUS_RECONNECTING = "reconnecting";
const STATUS_CONNECTED = "connected";

const RECONNECT_TIMEOUT = 5000;

const debug = debugLibrary("airdash:AISClient");

class AISClient {
  constructor(hostname, port, onMessage = null) {
    this.hostname = hostname;
    this.port = port;
    this.onMessage = onMessage;

    this.status = STATUS_DISCONNECTED;

    this.socket = null;
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
    this.socket = new net.Socket();

    this.socket.on("close", () => {
      this._handleDisconnect();
    });

    this.socket.on("error", (err) => {
      this._handleError(err);
    });

    this.socket.connect(this.port, this.hostname, () => {
      this.status = STATUS_CONNECTED;
      const aisDecoder = new AisDecoder({ silent: true });
      this.socket
        .pipe(split())
        .pipe(aisDecoder)
        .on("data", (decodedMessage) => {
          this._handleNewMessage(JSON.parse(decodedMessage));
        });
    });
  }

  disconnect() {
    if (!this.socket) {
      return;
    }
    this.socket.destroy();
    this.status = STATUS_DISCONNECTED;
  }

  _handleDisconnect() {
    if (this.status !== STATUS_DISCONNECTED && this.status !== STATUS_RECONNECTING) {
      debug(`Got disconnected, scheduling reconnect`);
      this._scheduleReconnect();
    }
  }

  _handleError(err) {
    debug(`Got error: ${err}`);
    if (this.status !== STATUS_DISCONNECTED && this.status !== STATUS_RECONNECTING) {
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

  _handleNewMessage(message) {
    if (this.onMessage) {
      this.onMessage(message);
    }
  }
}

module.exports = AISClient;
