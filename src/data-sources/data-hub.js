import debugLibrary from "debug";
import AirdashApiClient from "../lib/airdash-api-client";

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
    
    this.entities = {};
    this.client = new AirdashApiClient();
    this.poller = null;
    this.maxAgeSeconds = 30;
    this.cleanupTimer = null;
  }

  start() {
    if (this.poller) {
      throw new Error('Already started');
    }
    this.pollOnce();
  }

  async pollOnce() {
    try {
      if (this.poller) {
        clearTimeout(this.poller);
        this.poller = null;
      }
      await this.refreshEntities();
    } finally {
      this.poller = setTimeout(() => this.pollOnce(), 1000);
    }
  }

  stop() {
    if (this.poller) {
      clearTimeout(this.poller);
      this.poller = null;
    }
  }

  async refreshEntities() {
    let result;
    try {
      result = await this.client.getEntities();
    } catch (e) {
      if (e instanceof AirdashApiClient.ResponseError) {
        debug(`AirDash API: response error: ${e.cause}`);
      } else if (e instanceof AirdashApiClient.ConnectionError) {
        debug(`AirDash API: connection error: ${e.cause}`);
      } else {
        console.error(`AirDash API: request error: ${e}`);
      }
    }
    if (result) {
      this.entities = result.entities;
      this.onChange(this.entities);
    }
  }

}
