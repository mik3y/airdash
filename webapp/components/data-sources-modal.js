import React, { useState, useContext } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import DataHubContext from "AirDash/webapp/providers/DataHubContext";

const TYPE_READSB = "readsb-proto";
const TYPE_AIS = "ais-backend";

const NewDataSourceForm = ({ onAdded }) => {
  const [hostname, setHostname] = useState("");
  const [port, setPort] = useState("");
  const [type, setType] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addingError, setAddingError] = useState(null);
  const { addDataSource } = useContext(DataHubContext);

  const doSubmit = async (e) => {
    e.preventDefault();
    // onSubmit({ type, hostname, port });
    let dataSource;
    setIsAdding(true);
    try {
      // if (type === TYPE_READSB) {
      //   dataSource = new ReadsbProtoDataSource(`http://${hostname}:${port}`);
      // } else if (type === TYPE_AIS) {
      //   dataSource = new AisBackendDataSource(hostname, port);
      // } else {
      //   throw new Error("Unknown type");
      // }
      // await dataSource.check();
      // addDataSource(dataSource);
      // onAdded(dataSource);
    } catch (error) {
      setAddingError(error);
    } finally {
      setIsAdding(false);
    }
  };

  if (addingError) {
    return (
      <>
        <Alert show variant="danger">
          <Alert.Heading>Error Adding Data Source</Alert.Heading>
          <p>
            We couldn't add that data source. The error was:
            {`${addingError}`}
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              onClick={() => setAddingError(null)}
              variant="outline-danger"
            >
              Ok
            </Button>
          </div>
        </Alert>
      </>
    );
  }

  return (
    <Form>
      <Form.Group>
        <Form.Label>Type</Form.Label>
        <Form.Control
          as="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value={""}>Select type...</option>
          <option value={TYPE_READSB}>Readsb Proto</option>
          <option value={TYPE_AIS}>AIS NMEA Feed</option>
        </Form.Control>
        {type === TYPE_READSB && (
          <Form.Text className="text-muted">
            Connects to a Readsb server's HTTP API through this browser.
          </Form.Text>
        )}
        {type === TYPE_AIS && (
          <Form.Text className="text-muted">
            Connects to an AIS NMEA TCP stream through the AirDash backend.
          </Form.Text>
        )}
      </Form.Group>

      {type && (
        <>
          <Form.Group
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
          >
            <Form.Label>Hostname</Form.Label>
            <Form.Control placeholder="" />
          </Form.Group>

          <Form.Group value={port} onChange={(e) => setPort(e.target.value)}>
            <Form.Label>Port</Form.Label>
            <Form.Control placeholder="" />
          </Form.Group>

          <Button
            disabled={isAdding}
            variant="primary"
            type="submit"
            onClick={doSubmit}
          >
            Submit
          </Button>
        </>
      )}
    </Form>
  );
};

const DataSourcesModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header>Add Data Source</Modal.Header>
      <Modal.Body>
        <NewDataSourceForm onAdded={() => onHide()} />
      </Modal.Body>
    </Modal>
  );
};

DataSourcesModal.propTypes = {};

export default DataSourcesModal;
