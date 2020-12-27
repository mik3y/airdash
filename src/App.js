import "./App.scss";
import MapView from "./MapView";
import AircraftTable from "./AircraftTable";
import DataSourcesTable from "./components/data-sources-table";
import { DataHubProvider } from "./DataHubContext";
import { Accordion, Card } from "react-bootstrap";

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
            <Accordion defaultActiveKey="sources">
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="sources">
                  Data Sources
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="sources">
                  <Card.Body>
                    <DataSourcesTable />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="aircraft">
                  Aircraft
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="aircraft">
                  <Card.Body>
                    <AircraftTable />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </div>
        </div>
      </div>
    </DataHubProvider>
  );
}

export default App;
