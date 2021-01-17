import React, { useContext } from "react";
import DataHubContext from "AirDash/webapp/providers/DataHubContext";
import { Table } from "react-bootstrap";

import "./aircraft-table.scss";

const AircraftTable = (props) => {
  const { aircraft } = useContext(DataHubContext);

  if (!aircraft.length) {
    return null;
  }

  const rows = aircraft.map((a) => {
    const { adsbData } = a.aircraftInfo;
    return (
      <tr key={a.id}>
        <td>{adsbData.addr.toString(16).toUpperCase()}</td>
        <td>
          <tt>{adsbData.flight}</tt>
        </td>
        <td>{adsbData.squawk ? adsbData.squawk.toString(16) : ""}</td>
        <td>{adsbData.altBaro}</td>
        <td>{adsbData.gs}</td>
        <td>{adsbData.distance}</td>
      </tr>
    );
  });

  return (
    <div className="table-container aircraft-table">
      <Table striped hover size="sm">
        <thead>
          <tr>
            <th>ICAO</th>
            <th>Flight</th>
            <th>Squawk</th>
            <th>Altitude (ft)</th>
            <th>Speed (kt)</th>
            <th>Distance (nm)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

AircraftTable.propTypes = {};

export default AircraftTable;
