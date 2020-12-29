const protobufjs = require("protobufjs");
const AISProto = protobufjs.loadSync(`${__dirname}/../src/proto/ais.proto`);

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
      result = existing;
      break;
  }
  if (result) {
      result.lastUpdateTimestampMillis = (new Date()).getTime();
      const errorMessage = AISProto.PositionReport.verify(result);
      if (errorMessage) {
          throw new Error(errorMessage);
      }
  }
  return result;
};

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
  if (aisMessage.navStatus !== null && aisMessage.navStatus !== 15) {
    output.navigationalStatus = aisMessage.navStatus;
  }
  if (aisMessage.rateOfTurn !== null) {
    // TODO(mikey): Interpret this field.
    output.rateOfTurn = aisMessage.rateOfTurn;
  }
  if (aisMessage.speedOverGround !== null) {
    output.speedOverGround = aisMessage.speedOverGround / 10;
  }
  if (aisMessage.courseOverGround !== null) {
    output.courseOverGround = aisMessage.courseOverGround / 10;
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

const processType5 = (aisMessage, output) => {
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
  if (aisMessage.typeAndCargo) {
    output.shipType = aisMessage.typeAndCargo;
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

module.exports = {
  protoFromMessage,
};
