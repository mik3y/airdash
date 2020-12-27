import React, { useContext } from "react";
import DataHubContext from "../DataHubContext";
import { Table } from "react-bootstrap";

import "./aircraft-table.scss";

const AircraftTable = (props) => {
  const { aircraft } = useContext(DataHubContext);

  if (!aircraft.length) {
    return null;
  }

  const rows = aircraft.map((a) => {
    return (
      <tr key={a.addr}>
        <td>{a.addr.toString(16).toUpperCase()}</td>
        <td>
          <tt>{a.flight}</tt>
        </td>
        <td>{a.squawk ? a.squawk.toString(16) : ""}</td>
        <td>{a.altBaro}</td>
        <td>{a.gs}</td>
        <td>{a.distance}</td>
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
