import React from "react";
import PropTypes from "prop-types";

import "./entity-popup.scss";

const AircraftDetail = ({ entity }) => {
  const { adsbData } = entity;
  const title = adsbData.flight || entity.id;
  return (
    <div>
      <h3>{title}</h3>
      <table className="table table-condensed table-hover popup-table">
        <tbody>
          <tr>
            <th>Squawk</th>
            <td>{adsbData.squawk}</td>
          </tr>
          <tr>
            <th>Altitude</th>
            <td>{adsbData.altBaro}</td>
          </tr>
          <tr>
            <th>Vertical rate (ft/min)</th>
            <td>{adsbData.baroRate}</td>
          </tr>
          <tr>
            <th>Heading</th>
            <td>{adsbData.track}&deg;</td>
          </tr>
          <tr>
            <th>Ground speed</th>
            <td>{adsbData.gs}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-muted">
        <a onClick={() => console.log(entity)}>
          Click here to dump raw data to console
        </a>
        .
      </p>
    </div>
  );
};

const NavigationalStatus = ({ status }) => {
  switch (status) {
    case "NAVIGATIONAL_STATUS_UNDERWAY_ENGINE":
      return "Underway (engine)";
    case "NAVIGATIONAL_STATUS_AT_ANCHOR":
      return "Anchored";
    case "NAVIGATIONAL_STATUS_NOT_UNDER_COMMAND":
      return "Not under command";
    case "NAVIGATIONAL_STATUS_RESTRICTED_MANEUVERABILITY":
      return "Restricted manueverability";
    case "NAVIGATIONAL_STATUS_DRAUGHT_CONSTRAINED":
      return "Draught constrained";
    case "NAVIGATIONAL_STATUS_MOORED":
      return "Moored";
    case "NAVIGATIONAL_STATUS_AGROUND":
      return "Aground";
    case "NAVIGATIONAL_STATUS_FISHING":
      return "Fishing";
    case "NAVIGATIONAL_STATUS_UNDERWAY_SAILING":
      return "Underway (sailing)";
    case "NAVIGATIONAL_STATUS_RESERVED_9":
      return "Reserved (9)";
    case "NAVIGATIONAL_STATUS_RESERVED_10":
      return "Reserved (10)";
    case "NAVIGATIONAL_STATUS_TOWING_ASTERN":
      return "Towing astern";
    case "NAVIGATIONAL_STATUS_PUSHING_AHEAD":
      return "Pushing ahead";
    case "NAVIGATIONAL_STATUS_RESERVED_13":
      return "Reserved (13)";
    case "NAVIGATIONAL_STATUS_AIS_SART":
      return "SART";
    case "NAVIGATIONAL_STATUS_UNDEFINED":
      return "Unknown";
    default:
      return <>{status}</>;
  }
};

const VesselDetail = ({ entity }) => {
  const { aisData } = entity;
  const title = aisData.name || aisData.callSign || aisData.mmsi;
  return (
    <div>
      <h3>{title}</h3>
      <table className="table table-condensed table-hover popup-table">
        <tbody>
          {aisData.name && (
            <tr>
              <th>Name</th>
              <td>{aisData.name}</td>
            </tr>
          )}
          {aisData.shipType && (
            <tr>
              <th>Type</th>
              <td>{aisData.shipType}</td>
            </tr>
          )}
          {aisData.destination && (
            <tr>
              <th>Destination</th>
              <td>{aisData.destination}</td>
            </tr>
          )}
          <tr>
            <th>MMSI</th>
            <td>{aisData.mmsi}</td>
          </tr>
          {aisData.navigationalStatus && (
            <tr>
              <th>Status</th>
              <td>
                <NavigationalStatus status={aisData.navigationalStatus} />
              </td>
            </tr>
          )}
          <tr>
            <th>Speed</th>
            <td>{aisData.speedOverGround}</td>
          </tr>
          <tr>
            <th>Course</th>
            <td>{aisData.courseOverGround}</td>
          </tr>
          <tr>
            <th>Heading</th>
            <td>{aisData.heading}&deg;</td>
          </tr>
        </tbody>
      </table>
      <p className="text-muted">
        Click <a onClick={() => console.log(entity)}>here</a> to dump raw data
        to console.
      </p>
    </div>
  );
};

/** Show entity detail. Meant to be rendered in the map popup. */
const EntityPopup = ({ entity }) => {
  switch (entity.type) {
    case "ADSB":
      return <AircraftDetail entity={entity} />;
    case "AIS":
      return <VesselDetail entity={entity} />;
    default:
      return <b>Error: Unknown entity</b>;
  }
};

EntityPopup.propTypes = {};

export default EntityPopup;
