import React, { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./MapView.scss";

import DataHubContext from "./DataHubContext";
import PlaneIcon from "./PlaneIcon";
import BoatIcon from "./BoatIcon";
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

  const markers = Array.from(vessels.values()).map((entry) => {
    const { type, id, vessel } = entry;
    if (type === 'aircraft') {
      return (
        <Marker
          key={id}
          position={[vessel.lat, vessel.lon]}
          icon={PlaneIcon(vessel)}
        >
          <Popup>
            <div>
              <h2>{vessel.flight}</h2>
            </div>
          </Popup>
        </Marker>
      );
    } else if (type === 'vessel') {
      if (!vessel.lat || !vessel.lon) {
        return null;
      }
      return (
        <Marker
          key={id}
          position={[vessel.lat, vessel.lon]}
          icon={BoatIcon(vessel)}
        >
          <Popup>
            <div>
              <h2>{vessel.mmsi}</h2>
            </div>
          </Popup>
        </Marker>
      );
    }
    return null;
  }).filter(Boolean);

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
