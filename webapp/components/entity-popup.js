import React from "react";
import "./entity-popup.scss";

const AircraftPopup = ({ entity }) => {
  const { aircraftInfo } = entity;
  const { adsbData } = aircraftInfo;
  const title = adsbData.flight || entity.id;
  return (
    <div>
      <h3>{title}</h3>
      {aircraftInfo.operator && (
        <div className="operator">{aircraftInfo.operator}</div>
      )}
    </div>
  );
};

const VesselPopup = ({ entity }) => {
  const { aisData } = entity.shipInfo;
  const title = aisData.name || aisData.callSign || aisData.mmsi;
  return (
    <div>
      <h3>{title}</h3>
    </div>
  );
};

/** Show entity detail. Meant to be rendered in the map popup. */
const EntityPopup = ({ entity }) => {
  switch (entity.type) {
    case "ADSB":
      return <AircraftPopup entity={entity} />;
    case "AIS":
      return <VesselPopup entity={entity} />;
    default:
      return <b>Error: Unknown entity</b>;
  }
};

EntityPopup.propTypes = {};

export default EntityPopup;
