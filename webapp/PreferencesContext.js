import React from "react";
import { useLocalStorage } from "react-use-storage";

const PreferencesContext = React.createContext(null);

/**
 * PreferencesProvider is a React ContextProvider that consolidates
 * all user-settable preferences: Things like the preferred map
 * location and zoom level.
 */
export const PreferencesProvider = function ({ children }) {
  const [mapCenter, doSetMapCenter] = useLocalStorage("map-center", [
    40.7128,
    -74.006,
  ]);
  const [zoomLevel, doSetZoomLevel] = useLocalStorage("zoom-level", 12);

  const setMapCenter = (v) => {
    // TODO(mikey): Validate
    doSetMapCenter(v);
  };

  const setZoomLevel = (v) => {
    // TODO(mikey): Validate
    doSetZoomLevel(v);
  };

  return (
    <PreferencesContext.Provider
      value={{
        mapCenter,
        setMapCenter,
        zoomLevel,
        setZoomLevel,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const PreferencesConsumer = PreferencesContext.Consumer;
export default PreferencesContext;
