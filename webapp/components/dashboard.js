import React, { useContext } from "react";
import MapView from "./map-view";
import DataHubContext from "AirDash/webapp/providers/DataHubContext";
import AircraftTable from "./aircraft-table";
import BoatTable from "./boat-table";
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
                Settings
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="sources">
                <Card.Body>
                  <em>Coming soon!</em>
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
                  Ships
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
