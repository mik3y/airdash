import React, { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./MapView.scss";

import DataHubContext from "./DataHubContext";
import PlaneIcon from "./PlaneIcon";
import L from "leaflet";

// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: require("leaflet/dist/images/marker-icon.png").default,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default,
});

const MapView = (props) => {
  const { vessels } = useContext(DataHubContext);
  const aircraft = Array.from(vessels.values())
    .filter((v) => v.type === "aircraft")
    .map((v) => v.vessel);

  const markers = aircraft.map((a) => {
    return (
      <Marker
        key={a.addr}
        position={[a.lat, a.lon]}
        icon={PlaneIcon(a)}
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
        scrollWheelZoom={true}
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
