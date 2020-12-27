import React, { useState, useEffect } from "react";
import debugLibrary from "debug";
import DataHub from "./data-sources/data-hub";
import ReadsbProtoDataSource from "./data-sources/readsb-proto-data-source";

const debug = debugLibrary("airdash:DataHubContext");

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
  const [dataHub, setDataHub] = useState(null);

  const onDataHubChange = ({ vessels: updatedVessels }) => {
    setVessels(new Map(updatedVessels));
  };

  useEffect(() => {
    const newHub = new DataHub(onDataHubChange);
    setDataHub(newHub);
    newHub.start();
    return () => newHub.stop();
  }, []);

  useEffect(() => {
    if (!dataHub) {
      return;
    }
    debug("Adding default data source to data hub");
    dataHub.addDataSource(
      new ReadsbProtoDataSource("http://discopi.local:8080")
    );
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

  return (
    <DataHubContext.Provider
      value={{
        addDataSource,
        removeDataSource,
        getDataSources,
        vessels,
      }}
    >
      <AddDataSourceModal show={showAdder} onHide={() => setShowAdder(false)} />
      {children}
    </DataHubContext.Provider>
  );
};

export const DataHubConsumer = DataHubContext.Consumer;
export default DataHubContext;
