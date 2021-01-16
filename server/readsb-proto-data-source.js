const debugLibrary = require("debug");
const ReadsbProtoClient = require("./readsb-proto-client");
const protobufjs = require("protobufjs");
const AirdashProto = protobufjs.loadSync(
  `${__dirname}/../proto/airdash.proto`
);
const AuxDb = require("./aux-db");
const LRU = require("lru-cache");

const debug = debugLibrary("airdash:ReadsbProtoDataSource");

const OPERATOR_PREFIX_RE = /^[A-Z]{3}/;

/**
 * An AirDash data source that reads from a readsb-proto HTTP service.
 */
class ReadsbProtoDataSource {
  static dataSourceType = "ADSB";
  static minimumTrackUpdateDistanceMeters = 50;

  constructor(url, onUpdate, onError = null) {
    this.url = url;
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.client = new ReadsbProtoClient(
      `http://${this.url.hostname}:${this.url.port}`
    );
    this.cache = new LRU({
      max: 1000,
      maxAge: 60 * 1000,
    });

    this.pollInterval = 1000;
    this.poller = null;
  }

  toString() {
    return `<ReadsbProtoDataSource ${this.url}>`;
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
    await this.client.getAircraft();
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

  getOperatorAndCountry(adsbData) {
    const flight = adsbData.flight;
    if (flight) {
      const m = OPERATOR_PREFIX_RE.exec(flight);
      if (m) {
        const code = m[0];
        const dbEntry = AuxDb.operators[code];
        if (dbEntry) {
          return dbEntry.slice(0, 2);
        }
      }
    }
    return ["", ""];
  }

  _processUpdate(update) {
    update.aircraft.forEach((aircraft) => {
      const id = aircraft.addr.toString(16).toUpperCase();
      const entityStatus =
        this.cache.get(id) ||
        AirdashProto.EntityStatus.create({
          id,
          type: AirdashProto.EntityType.ADSB,
          lat: aircraft.lat,
          lon: aircraft.lon,
        });
      const currentLat = aircraft.lat;
      const currentLon = aircraft.lon;
      if (currentLat === 0 && currentLon === 0 && entityStatus.lat === 0 && entityStatus.lon === 0) {
        // Ignore updates before we have position information.
        return;
      }

      const [tailNumber, typeDesignator] = AuxDb.aircrafts[id] || ["", ""];
      const [typeName, typeCode, typeWtc] = AuxDb.types[typeDesignator] || ["", "", ""];

      const [operator, countryName] = this.getOperatorAndCountry(aircraft);
      entityStatus.lat = currentLat;
      entityStatus.lon = currentLon;
      entityStatus.aircraftInfo = {
        ...entityStatus.aircraftInfo,
        adsbData: {
          ...aircraft,
          flight: aircraft.flight && aircraft.flight.trim(),
        },
        tailNumber,
        typeDesignator,
        typeCode,
        typeName,
        typeWtc,
        operator,
        countryName,
      };
      this.cache.set(id, entityStatus);
      this.onUpdate(entityStatus);
    });
  }

  _processError(error) {
    console.error(error);
    if (this.onError) {
      this.onError(error);
    }
  }
}

module.exports = ReadsbProtoDataSource;
