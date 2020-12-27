import "./App.scss";
import MapView from "./MapView";
import AircraftTable from "./AircraftTable";
import { DataHubProvider } from "./DataHubContext";

function App() {
  return (
    <DataHubProvider>
      <div className="App">
        <div className="columns is-gapless">
          <div className="column is-three-quarters">
            <MapView />
          </div>
          <div className="column">
            <h3>AirDash!</h3>
            <AircraftTable />
          </div>
        </div>
      </div>
    </DataHubProvider>
  );
}

export default App;
