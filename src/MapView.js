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
  const { entities } = useContext(DataHubContext);

  const markers = Object.values(entities).map((entity) => {
    const { type, id, lat, lon } = entity;
    if (!lat || !lon) {
      return null;
    }
    if (type === 'ADSB') {
      return (
        <Marker
          key={id}
          position={[lat, lon]}
          icon={PlaneIcon(entity.adsbData)}
        >
          <Popup>
            <div>
              <h2>{entity.adsbData.flight}</h2>
            </div>
          </Popup>
        </Marker>
      );
    } else if (type === 'AIS') {
      return (
        <Marker
          key={id}
          position={[lat, lon]}
          icon={BoatIcon(entity.aisData)}
        >
          <Popup>
            <div>
              {entity.aisData.name && <h2>{entity.aisData.name}</h2>}
              <h3>{entity.aisData.mmsi}</h3>
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
