import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./MapView.scss";

import ReadsbClient from "./ReadsbClient";
import L from "leaflet";

// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: require("leaflet/dist/images/marker-icon.png").default,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default,
});

const CLIENT = new ReadsbClient("http://discopi.local:8080");

const MapView = (props) => {
  const [allAircraft, setAllAircraft] = useState([]);

  const updateEvents = async () => {
    try {
      const update = await CLIENT.getAircraft();
      console.log("Aircraft update:", update);
      setAllAircraft(update.aircraft);
    } catch (e) {
      console.error(e);
    }
  };

  // Once proto definition is available, spin up a client.
  useEffect(() => {
    let poller;
    async function load() {
      const stats = await CLIENT.getStats();
      console.log('Stats', stats);
      const receiver = await CLIENT.getReceiver();
      console.log('receiver', receiver);
      updateEvents();
      poller = setInterval(updateEvents, 1000);
    }
    load();
    return () => {
      clearInterval(poller);
    };
  }, []);

  const markers = allAircraft.map((a) => {
    return (
      <Marker
        key={a.addr}
        position={[a.lat, a.lon]}
      >
        <Popup>
          <div>
            <h2>{a.flight}</h2>
          </div>
        </Popup>
      </Marker>
    );
  });

  return (
    <div>
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={8}
        scrollWheelZoom={false}
        style={{ height: "100vh" }}
      >
        {markers}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

MapView.propTypes = {};

export default MapView;
