/**
 * The Connection Manager manages this web service's TCP connections
 * to data sources.
 */

const AISClient = require("./ais-client");

const MAX_UPDATES_PER_CLIENT = 100;

class ConnectionManager {
  constructor() {
    this.aisConnections = new Map();
    this.aisUpdates = new Map();
  }

  addAISConnection(host, port) {
    const connectionId = `${host}:${port}`;
    if (this.aisConnections.has(connectionId)) {
      throw new Error(`Already have a connection to ${connectionId}`);
    }
    const client = new AISClient(host, port);
    this.aisConnections.set(connectionId, client);
    this.aisUpdates.set(connectionId, []);
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
      client.disconnect();
    }
  }

  getAISData(host, port) {
    const connectionId = `${host}:${port}`;
    const updates = this.aisUpdates.get(connectionId);
    return updates;
  }

  _handleNewMessage(connectionId, client, message) {
    let updateList = this.aisUpdates.get(connectionId);
    updateList.push(message);
    if (updateList.length > MAX_UPDATES_PER_CLIENT) {
      this.aisUpdates.set(connectionId, updateList.slice(-MAX_UPDATES_PER_CLIENT));
    }
  }

}

module.exports = ConnectionManager;
