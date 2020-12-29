/**
 * The Connection Manager manages this web service's TCP connections
 * to data sources.
 */

const AISClient = require("./ais-client");
const AIS = require('./ais');

const MAX_UPDATES_PER_CLIENT = 100;

class ConnectionManager {
  constructor() {
    this.aisConnections = new Map();

    // Maps mmsi -> type -> merged most recent data.
    this.aisUpdates = new Map();
  }

  addAISConnection(host, port) {
    const connectionId = `${host}:${port}`;
    if (this.aisConnections.has(connectionId)) {
      throw new Error(`Already have a connection to ${connectionId}`);
    }
    const client = new AISClient(host, port);
    this.aisConnections.set(connectionId, client);
    this.aisUpdates.set(connectionId, new Map());
    client.onMessage = (message) => {
      this._handleNewMessage(connectionId, client, message);
    };
    client.connect();
  }

  removeAISConnection(host, port) {
    const connectionId = `${host}:${port}`;
    if (this.aisConnections.has(connectionId)) {
      const client = this.aisConnections.get(connectionId);
      this.aisConnections.delete(connectionId);
      this.aisUpdates.delete(connectionId);
      client.disconnect();
    }
  }

  getAISData(host, port) {
    const connectionId = `${host}:${port}`;
    const updates = this.aisUpdates.get(connectionId);
    return updates;
  }

  _handleNewMessage(connectionId, client, message) {
    const updateMap = this.aisUpdates.get(connectionId);
    const key = `${message.mmsi}`;

    if (!key) {
      return;
    }

    const existing = updateMap.get(key);
    const processed = AIS.protoFromMessage(message, existing);
    if (processed) {
      updateMap.set(key, processed);
    }
  }
}

module.exports = ConnectionManager;
