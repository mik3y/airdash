import "./App.scss";
import React from "react";
import Dashboard from "./components/dashboard";
import { DataHubProvider } from "AirDash/webapp/providers/DataHubContext";
import { PreferencesProvider } from "AirDash/webapp/providers/PreferencesContext";

function App() {
  return (
    <PreferencesProvider>
      <DataHubProvider>
        <Dashboard />
      </DataHubProvider>
    </PreferencesProvider>
  );
}

export default App;
