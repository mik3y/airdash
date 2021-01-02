import React, { useContext } from "react";
import DataHubContext from "AirDash/webapp/providers/DataHubContext";
import { Button } from "react-bootstrap";

import "./data-sources-table.scss";

const DataSourcesTable = (props) => {
  const { getDataSources, showDataSourceAdder } = useContext(DataHubContext);
  // const dataSources = getDataSources();
  const dataSources = new Map();

  const getTable = () => {
    const rows = Array.from(dataSources.values()).map((dataSource) => {
      let address, type;
      // if (dataSource instanceof ReadsbProtoDataSource) {
      //   type = "Readsb Proto";
      //   address = dataSource.baseUrl;
      // } else if (dataSource instanceof AisBackendDataSource) {
      //   type = "AIS Feed";
      //   address = `${dataSource.hostname}:${dataSource.port}`;
      // }
      return (
        <tr key={address}>
          <td>{type}</td>
          <td>
            <tt>{address}</tt>
          </td>
          <td></td>
        </tr>
      );
    });

    if (!rows.length) {
      return null;
    }

    return (
      <div className="table-container data-sources-table">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {getTable()}
      <Button size={"sm"} block onClick={showDataSourceAdder}>
        Add data source
      </Button>
    </div>
  );
};

DataSourcesTable.propTypes = {};

export default DataSourcesTable;
