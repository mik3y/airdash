import "./App.scss";
import React from "react";
import Dashboard from "./Dashboard";
import { DataHubProvider } from "./DataHubContext";

function App() {
  return (
    <DataHubProvider>
      <Dashboard />
    </DataHubProvider>
  );
}

export default App;
