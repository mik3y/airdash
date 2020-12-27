import React, { useState, useEffect } from "react";
import DataHub from "./data-sources/data-hub";
import DataSourcesModal from "./components/data-sources-modal";

const DataHubContext = React.createContext(null);

/**
 * DataHubProvider is a React ContextProvider that acts as the
 * primary hub of data coming from all data sources.
 *
 * An AirDash application instance will have a single provider,
 * and may have multiple consumers throughout the app.
 */
export const DataHubProvider = function ({ children }) {
  const [vessels, setVessels] = useState(new Map());
  const [showAdder, setShowAdder] = useState(true);

  const onDataHubChange = ({ vessels: updatedVessels }) => {
    setVessels(new Map(updatedVessels));
  };

  const [dataHub] = useState(new DataHub(onDataHubChange));

  useEffect(() => {
    dataHub.start();
    return () => dataHub.stop();
  }, [dataHub]);

  const addDataSource = (dataSource) => {
    dataHub.addDataSource(dataSource);
  };

  const removeDataSource = (dataSource) => {
    dataHub.removeDataSource(dataSource);
  };

  const getDataSources = () => {
    return dataHub.dataSources;
  };

  const showDataSourceAdder = () => {
    setShowAdder(true);
  }

  const aircraft = Array.from(vessels.values())
    .filter((v) => v.type === "aircraft")
    .map((v) => v.vessel);

  const boats = Array.from(vessels.values())
    .filter((v) => v.type === "vessel")
    .map((v) => v.vessel);

  return (
    <DataHubContext.Provider
      value={{
        addDataSource,
        removeDataSource,
        getDataSources,
        vessels,
        aircraft,
        boats,
        showDataSourceAdder,
      }}
    >
      <DataSourcesModal show={showAdder} onHide={() => setShowAdder(false)} />
      {children}
    </DataHubContext.Provider>
  );
};

export const DataHubConsumer = DataHubContext.Consumer;
export default DataHubContext;
