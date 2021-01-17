import React, { useContext } from "react";
import MapView from "./map-view";
import DataHubContext from "AirDash/webapp/providers/DataHubContext";
import AircraftTable from "./aircraft-table";
import BoatTable from "./boat-table";
import EntityDetail from "./entity-detail";
import { Accordion, Card } from "react-bootstrap";

function Dashboard() {
  const { aircraft, boats, activeEntity, setActiveEntityId } = useContext(
    DataHubContext
  );

  return (
    <div className="App">
      <div className="columns is-gapless">
        <div className="column is-three-quarters">
          <MapView />
        </div>
        <div className="column">
          {activeEntity && (
            <Card>
              <Card.Body>
                <EntityDetail entity={activeEntity} />
              </Card.Body>
            </Card>
          )}
          <Accordion>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="settings">
                Settings
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="settings">
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
