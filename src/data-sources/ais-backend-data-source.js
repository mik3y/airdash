import debugLibrary from "debug";
import AirdashApiClient from "../lib/airdash-api-client";

const debug = debugLibrary("airdash:AisBackendDataSource");

/**
 * An AirDash data source that reads from a readsb-proto HTTP service.
 */
export default class AisBackendDataSource {
  constructor(hostname, port, config = {}, onUpdate = null, onError = null) {
    this.hostname = hostname;
    this.port = port;
    this.config = config;
    this.onUpdate = onUpdate;
    this.onError = onError;

    this.pollInterval = Number.parseInt(config.pollInterval, 10) || 1000;
    this.poller = null;
    this.client = new AirdashApiClient();
  }

  toString() {
    return `<AisBackendDataSource ${this.baseUrl}>`;
  }

  start() {
    if (this.poller) {
      return;
    }
    this.poller = setTimeout(() => this._pollNow(), 0);
  }

  stop() {
    if (!this.poller) {
      return;
    }
    clearTimeout(this.poller);
    this.poller = null;
  }

  async check() {
    try {
      await this.client.getAISUpdates(this.hostname, this.port);
    } catch (error) {
      await this.client.addAISSource(this.hostname, this.port);
    }
  }

  async _pollNow() {
    try {
      const update = await this.client.getAISUpdates(this.hostname, this.port);
      this._processUpdate(update);
    } catch (e) {
      this._processError(e);
    } finally {
      this.poller = setTimeout(() => this._pollNow(), this.pollInterval);
    }
  }

  _processUpdate(update) {
    const { updates } = update;
    const updateMessage = Object.values(updates)
      .map((v) => v["1"])
      .filter(Boolean)
      .map((type1Message) => {
        return {
          type: "vessel",
          id: `${type1Message.mmsi}`,
          vessel: type1Message,
        };
      });
    if (this.onUpdate) {
      this.onUpdate(updateMessage);
    }
  }

  _processError(error) {
    console.error(error);
    if (this.onError) {
      this.onError(error);
    }
  }
}
