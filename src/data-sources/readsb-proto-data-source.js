import debugLibrary from "debug";
import ReadsbProtoClient from "./readsb-proto-client";

const debug = debugLibrary("airdash:ReadsbProtoDataSource");

/**
 * An AirDash data source that reads from a readsb-proto HTTP service.
 */
export default class ReadsbProtoDataSource {
  constructor(baseUrl, config = {}, onUpdate = null, onError = null) {
    this.baseUrl = baseUrl;
    this.config = config;
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.client = new ReadsbProtoClient(baseUrl);

    this.pollInterval = Number.parseInt(config.pollInterval, 10) || 1000;
    this.poller = null;
  }

  toString() {
    return `<ReadsbProtoDataSource ${this.baseUrl}>`;
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

  async _pollNow() {
    try {
      const update = await this.client.getAircraft();
      this._processUpdate(update);
    } catch (e) {
      this._processError(e);
    } finally {
      this.poller = setTimeout(() => this._pollNow(), this.pollInterval);
    }
  }

  _processUpdate(update) {
    debug("Aircraft update:", update);
    const updateMessage = update.aircraft.map((aircraft) => {
      return {
        type: "aircraft",
        id: aircraft.addr.toString(16).toUpperCase(),
        vessel: aircraft,
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
