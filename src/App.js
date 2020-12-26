import "./App.scss";
import MapView from "./MapView";

function App() {
  return (
    <div className="App">
      <div className="columns is-gapless">
        <div className="column is-four-fifths">
          <MapView />
        </div>
        <div className="column">
          <h3>AirDash!</h3>
        </div>
      </div>
    </div>
  );
}

export default App;
