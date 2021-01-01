import "./App.scss";
import React from "react";
import Dashboard from "./Dashboard";
import { DataHubProvider } from "./DataHubContext";
import { PreferencesProvider } from "./PreferencesContext";

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
