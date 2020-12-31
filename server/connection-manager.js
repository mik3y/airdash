/**
 * The Connection Manager manages this web service's TCP connections
 * to data sources.
 */

const AISDataSource = require("./ais-data-source");
const ReadsbProtoDataSource = require("./readsb-proto-data-source");
const LRU = require("lru-cache");
const debugLibrary = require("debug");
const debug = debugLibrary("airdash:connection-manager");

const PROTOCOL_AIS = "ais:";
const PROTOCOL_READSB_PROTO = "readsb-proto:";

class ConnectionManagerError extends Error {
  static status = 500;
}
class BadURIError extends ConnectionManagerError {
  static status = 400;
}

class AlreadyConnectedError extends ConnectionManagerError {
  static status = 400;
}

// TODO: Need to move whole concept of data sources down into the
// server layer. Server should have two similar classes, one for AIS
// data source and one for readsb-proto. In both cases should generate
// normalize position updates
class ConnectionManager {
  constructor() {
    this.dataSources = new Map();
    this.entities = new LRU({
      max: 1000,
      maxAge: 60 * 60 * 1000,
    });
  }

  addDataSource(uri) {
    const url = new URL(uri);
    const connectionId = this._getConnectionId(url);
    if (this.dataSources.has(connectionId)) {
      throw new AlreadyConnectedError(`Already connected to ${url}`);
    }

    let dataSource;
    switch (url.protocol) {
      case PROTOCOL_AIS:
        dataSource = this._createAisDataSource(url);
        break;
      case PROTOCOL_READSB_PROTO:
        dataSource = this._createReadsbProtoDataSource(url);
        break;
      default:
        throw new BadURIError(`Unsupported protocol "${url.protocol}\"`);
    }

    debug(`Added data source ${url}`);
    dataSource.start();
    this.dataSources.set(connectionId, dataSource);
  }

  getDataSources() {
    const obj = {};
    this.dataSources.forEach((value, key) => (obj[key] = value));
    return obj;
  }

  _getConnectionId(url) {
    return `${url.protocol}${url.hostname}:${url.port}`;
  }

  _createAisDataSource(url) {
    const connectionId = this._getConnectionId(url);
    const dataSource = new AISDataSource(
      url,
      (u) => this._onDataSourceUpdate(dataSource, connectionId, u),
      (e) => this._onDataSourceError(dataSource, connectionId, e)
    );
    return dataSource;
  }

  _createReadsbProtoDataSource(url) {
    const connectionId = this._getConnectionId(url);
    const dataSource = new ReadsbProtoDataSource(
      url,
      (u) => this._onDataSourceUpdate(dataSource, connectionId, u),
      (e) => this._onDataSourceError(dataSource, connectionId, e)
    );
    return dataSource;
  }

  _onDataSourceUpdate(dataSource, connectionId, update) {
    // debug(`Updating entity ${connectionId}: ${update}`);
    const cacheKey = `${connectionId}:${update.id}`;
    this.entities.set(cacheKey, update);
  }

  _onDataSourceError(dataSource, connectionId, error) {
    // console.log("Data source error:", dataSource, error);
  }
}

module.exports = ConnectionManager;
