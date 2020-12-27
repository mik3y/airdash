import React, { useContext } from "react";
import MapView from "./MapView";
import DataHubContext from "./DataHubContext";
import AircraftTable from "./components/aircraft-table";
import BoatTable from "./components/boat-table";
import DataSourcesTable from "./components/data-sources-table";
import { Accordion, Card } from "react-bootstrap";

function Dashboard() {
  const { aircraft, boats } = useContext(DataHubContext);

  return (
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
            {aircraft.length > 0 && (
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
            )}
            {boats.length > 0 && (
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="boats">
                  Vessels
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="boats">
                  <Card.Body>
                    <BoatTable />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
