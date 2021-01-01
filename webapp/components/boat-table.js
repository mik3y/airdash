import React, { useContext } from "react";
import DataHubContext from "../DataHubContext";
import { Table } from "react-bootstrap";

import "./boat-table.scss";

const BoatTable = (props) => {
  const { boats, activeEntityId, setActiveEntityId } = useContext(
    DataHubContext
  );

  if (!boats.length) {
    return null;
  }

  const toggleActive = (id) => {
    if (activeEntityId === id) {
      setActiveEntityId(null);
    } else {
      setActiveEntityId(id);
    }
  };

  const entitySort = (a, b) => {
    // Always sort the active entity to the top.
    if (a.id === activeEntityId) {
      return -2;
    } else if (b.id === activeEntityId) {
      return 2;
    }

    if (a.id === b.id) {
      return 0;
    }
    if (b.id > a.id) {
      return -1;
    }
    return 1;
  };
  
  const rows = boats.sort(entitySort).map((b) => {
    const { aisData } = b;
    const rowColor = b.id === activeEntityId ? "table-primary" : "";
    return (
      <tr
        key={aisData.mmsi}
        className={rowColor}
        onClick={() => toggleActive(b.id)}
      >
        <td>{aisData.mmsi}</td>
        <td>{aisData.name}</td>
        <td>{aisData.speedOverGround}</td>
        <td>{aisData.heading}</td>
      </tr>
    );
  });

  return (
    <div className="table-container aircraft-table">
      <Table striped hover size="sm">
        <thead>
          <tr>
            <th>MMSI</th>
            <th>Name</th>
            <th>Speed</th>
            <th>Heading</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

BoatTable.propTypes = {};

export default BoatTable;
