/**
 * The Connection Manager manages this web service's TCP connections
 * to data sources.
 */

const AISClient = require("./ais-client");

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

    if (!updateMap.has(key)) {
      updateMap.set(key, new Map());
    }
    const vesselData = updateMap.get(key);

    const messageType = `${message.type}`;
    const messageData = vesselData.get(messageType) || {};

    for (const [key, value] of Object.entries(message)) {
      if (value === null) {
        continue;
      }
      messageData[key] = value;
    }
    messageData.lastUpdateMillis = new Date() / 1000;

    vesselData.set(messageType, messageData);
    vesselData.set('lastUpdateMillis', messageData.lastUpdateMillis);
  }
}

module.exports = ConnectionManager;
