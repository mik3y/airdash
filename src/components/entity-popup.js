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
    </div>
  );
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
          <tr>
            <th>Status</th>
            <td>{aisData.navigationalStatus}</td>
          </tr>
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
    </div>
  );
};

/** Show entity detail. Meant to be rendered in the map popup. */
const EntityPopup = ({ entity }) => {
  console.log(entity);
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
