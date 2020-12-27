import debugLibrary from "debug";

const debug = debugLibrary("airdash:DataHub");

/**
 * A DataHub takes one or more DataSource backends and aggregates
 * their updates.
 * 
 * In most deployments of AirDash, there's probably only going to
 * be a single data source, since most users probably only operate
 * a single feeder of a certain type.
 * 
 * Multi-data-source deployments would hapen if:
 *   - Someone wants to show both ADS-B and AIS data on the same map
 *   - Someone is operating multiple ADS-B feeders and wants to show
 *     them in one place.
 */
export default class DataHub {
  constructor(onChange, config = {}) {
    this.onChange = onChange;
    this.dataSources = new Set();
    this.vessels = new Map();
  }

  addDataSource(dataSource) {
    this.dataSources.add(dataSource);
    dataSource.onUpdate = (update) => this._handleUpdate(dataSource, update);
    dataSource.onError = (error) => this._handleError(dataSource, error);
    dataSource.start();
  }

  removeDataSource(dataSource) {
    this.dataSources.delete(dataSource);
    dataSource.stop();
  }

  _handleUpdate(dataSource, update) {
    update.forEach((entity) => {
      const { type, id, vessel } = entity;
      const entityId = `${type}:${id}`;
      const existing = this.vessels.get(entityId);
      const entry = {
        type,
        id,
        vessel,
        lastUpdate: new Date(),
      };
      this.vessels.set(entityId, entry);
    });
    this.onChange({ vessels: this.vessels });
  }

  _handleError(dataSource, error) {
    debug(`Handling error from ${dataSource}`);
  }
}
