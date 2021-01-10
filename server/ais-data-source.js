const debugLibrary = require("debug");
const LRU = require("lru-cache");
const AISClient = require("./ais-client");

const debug = debugLibrary("airdash:ais-data-source");
const protobufjs = require("protobufjs");
const AISProto = protobufjs.loadSync(`${__dirname}/../proto/ais.proto`);
const AirdashProto = protobufjs.loadSync(
  `${__dirname}/../proto/airdash.proto`
);
const Settings = require('./settings');

/** Takes a raw AIS message and creates/updates our PositionReport type. */
const protoFromMessage = (aisMessage, existing = null) => {
  const { type } = aisMessage;

  let result;
  switch (type) {
    case 1:
    case 2:
    case 3:
      result = processType123(
        aisMessage,
        existing || AISProto.PositionReport.create()
      );
      break;
    case 5:
      result = processType5(
        aisMessage,
        existing || AISProto.PositionReport.create()
      );
      break;
    default:
      break;
  }
  if (result) {
    const errorMessage = AISProto.PositionReport.verify(result);
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    return result;
  }
  return existing;
};

/** Returns true iff the numeric value is a ship type we recognize (exists in our enum). */
const isValidShipType = (v) => {
  return !!AirdashProto.nested.ShipType.valuesById[v];
};

/** Returns true iff the numeric value is a navigational status we recognize. */
const isValidNavigationalStatus = (v) => {
  return (
    !!AirdashProto.nested.NavigationalStatus.valuesById[v] &&
    v !== AirdashProto.NavigationalStatus.NAVIGATIONAL_STATUS_UNDEFINED
  );
};

/** Implements AIS type 1, 2, and 3 message parsing for `protoFromMessage`. */
const processType123 = (aisMessage, output) => {
  // NOTE(mikey): Many of these fields have sentinel values for "unknown". For example,
  // a heading value of 511 means "unknown". The upstream `ais-stream-decoder` takes
  // care of these for us, and substitutes null when the information is unknown.
  if (aisMessage.mmsi) {
    // TODO(mikey): Throw error if conflict?
    output.mmsi = aisMessage.mmsi.toString();
  }
  if (aisMessage.lat) {
    output.lat = aisMessage.lat;
  }
  if (aisMessage.lon) {
    output.lon = aisMessage.lon;
  }
  const navStatus = Number.parseInt(aisMessage.navStatus, 10);
  if (isValidNavigationalStatus(navStatus)) {
    output.navigationalStatus = navStatus;
  }
  if (aisMessage.rateOfTurn !== null) {
    // TODO(mikey): Interpret this field.
    output.rateOfTurn = aisMessage.rateOfTurn;
  }
  if (aisMessage.speedOverGround !== null) {
    output.speedOverGround = aisMessage.speedOverGround;
  }
  if (aisMessage.courseOverGround !== null) {
    output.courseOverGround = aisMessage.courseOverGround;
  }
  if (aisMessage.heading !== null) {
    output.heading = aisMessage.heading;
  }
  if (aisMessage.specialManoeuvre !== 0) {
    // 0 = unknown, 1 = no, 2 = yes
    output.special_maneuver = aisMessage.specialManoeuvre === 2;
  }
  return output;
};

/** Implements AIS type 5 message parsing for `protoFromMessage`. */
const processType5 = (aisMessage, output) => {
  if (aisMessage.mmsi) {
    // TODO(mikey): Throw error if conflict?
    output.mmsi = aisMessage.mmsi.toString();
  }
  if (aisMessage.imo) {
    output.imoNumber = aisMessage.imo;
  }
  if (aisMessage.callsign) {
    const cleanedCallsign = aisMessage.callsign.replace(/@+$/, "");
    if (cleanedCallsign) {
      output.callsign = cleanedCallsign;
    }
  }
  if (aisMessage.name) {
    const cleanedName = aisMessage.name.replace(/@+$/, "");
    if (cleanedName) {
      output.name = cleanedName;
    }
  }

  const shipType = aisMessage.typeAndCargo;
  if (isValidShipType(shipType)) {
    output.shipType = shipType;
  }
  if (
    aisMessage.etaMonth !== null &&
    aisMessage.etaDay !== null &&
    aisMessage.etaHour !== null &&
    aisMessage.etaMinute !== null
  ) {
    const etaDate = new Date(
      new Date().getFullYear(),
      aisMessage.etaMonth,
      aisMessage.etaDay,
      aisMessage.etaHour,
      aisMessage.etaMinute,
      0,
      0
    );
    if (etaDate.getTime() !== NaN) {
      output.etaUtc = etaDate.toISOString();
    }
  }
  if (aisMessage.draught) {
    output.draught = aisMessage.draught;
  }
  if (aisMessage.destination) {
    const cleanedDestination = aisMessage.destination.replace(/@+$/, "");
    if (cleanedDestination) {
      output.destination = cleanedDestination;
    }
  }

  return output;
};

/**
 * An AirDash data source that reads from a readsb-proto client,
 * aggregating updates and translating them to AirDash updates.
 */
class AISDataSource {
  static dataSourceType = "AIS";
  static minimumTrackUpdateDistanceMeters = 10;

  constructor(url, onUpdate = null, onError = null) {
    this.url = url;
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.client = new AISClient(this.url, (message) => this._onClientMessage(message));
    this.cache = new LRU({
      max: 1000,
      maxAge: 60 * 60 * 1000,
    });
  }

  toString() {
    return `<AISDataSource ${this.url} status=${this.client.status}>`;
  }

  start() {
    if (this.poller) {
      return;
    }
    this.client.connect();
  }

  stop() {
    this.client.disconnect();
  }

  _onClientMessage(message) {
    try {
      this._processUpdate(message);
    } catch (e) {
      // Occasionally a malformed message (or our own bug) might
      // crash the message processor. If we are in debug mode, allow it to
      // crash things so a developer can attend to it. Otherwise, scold in
      // logs and keep charging on.
      console.error("Error processing update:", JSON.stringify(message));
      if (Settings.debug) {
        throw e;
      }
    }
  }

  _processUpdate(update) {
    const { mmsi } = update;
    if (!mmsi) {
      return;
    }
    const entityStatus =
      this.cache.get(mmsi) ||
      AirdashProto.EntityStatus.create({
        id: mmsi,
        type: AirdashProto.EntityType.AIS,
      });
    const aisData = protoFromMessage(update, entityStatus.aisData);
    if (!aisData) {
      return;
    }
    // debug(`Updating ${mmsi}`);
    entityStatus.aisData = aisData;
    entityStatus.lat = aisData.lat;
    entityStatus.lon = aisData.lon;
    entityStatus.lastUpdatedMillis = new Date().getTime();
    this.cache.set(mmsi, entityStatus);
    this.onUpdate(entityStatus);
  }

  _processError(error) {
    console.error(error);
    if (this.onError) {
      this.onError(error);
    }
  }
}

module.exports = AISDataSource;
