import React, { useContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMapEvent,
} from "react-leaflet";
import "./MapView.scss";

import DataHubContext from "./DataHubContext";
import PreferencesContext from "./PreferencesContext";
import PlaneIcon from "./PlaneIcon";
import BoatIcon from "./BoatIcon";
import EntityPopup from "./components/entity-popup";
import L from "leaflet";

// https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
  iconUrl: require("leaflet/dist/images/marker-icon.png").default,
  shadowUrl: require("leaflet/dist/images/marker-shadow.png").default,
});

/** Listens to Leaflet events and connects them to our own components. */
const MapStateHandler = () => {
  const { setMapCenter, setZoomLevel } = useContext(PreferencesContext);

  useMapEvent("zoomend", (e) => {
    const map = e.target;
    const zoomLevel = map.getZoom();
    setZoomLevel(zoomLevel);
  });

  useMapEvent("moveend", (e) => {
    const map = e.target;
    const center = map.getCenter();
    setMapCenter([center.lat, center.lng]);
  });

  return null;
};

const MapView = (props) => {
  const { entities } = useContext(DataHubContext);
  const { mapCenter, zoomLevel } = useContext(PreferencesContext);

  const markers = Object.values(entities)
    .map((entity) => {
      const { type, id, lat, lon } = entity;
      if (!lat || !lon) {
        return null;
      }
      if (type === "ADSB") {
        return (
          <Marker
            key={id}
            position={[lat, lon]}
            icon={PlaneIcon(entity.adsbData)}
          >
            <Popup>
              <EntityPopup entity={entity} />
            </Popup>
          </Marker>
        );
      } else if (type === "AIS") {
        return (
          <Marker
            key={id}
            position={[lat, lon]}
            icon={BoatIcon(entity.aisData)}
          >
            <Popup>
              <EntityPopup entity={entity} />
            </Popup>
          </Marker>
        );
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div>
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        style={{ height: "100vh" }}
      >
        <MapStateHandler />
        {markers}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Muted">
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Dark">
            <TileLayer
              attribution="Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution="Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
              url="http://{s}.tile.stamen.com/terrain-background/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain with Roads">
            <TileLayer
              attribution="Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL."
              url="http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
      </MapContainer>
    </div>
  );
};

MapView.propTypes = {};

export default MapView;
