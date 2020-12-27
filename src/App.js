import "./App.scss";
import MapView from "./MapView";
import AircraftTable from "./AircraftTable";
import { ReadsbProvider } from "./ReadsbContext";

function App() {
  return (
    <ReadsbProvider>
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
    </ReadsbProvider>
  );
}

export default App;
