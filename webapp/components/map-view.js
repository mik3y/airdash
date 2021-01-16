import React, { useContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  Polyline,
  useMapEvent,
} from "react-leaflet";
import "./map-view.scss";

import DataHubContext from "AirDash/webapp/providers/DataHubContext";
import PreferencesContext from "AirDash/webapp/providers/PreferencesContext";
import PlaneIcon from "./plane-icon";
import BoatIcon from "./boat-icon";
import EntityPopup from "./entity-popup";
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
  const { setMapCenter, setZoomLevel, zoomLevel } = useContext(PreferencesContext);

  useMapEvent("zoomend", (e) => {
    const map = e.target;
    const newZoomLevel = map.getZoom();
    setZoomLevel(newZoomLevel);
  });

  useMapEvent("moveend", (e) => {
    const map = e.target;
    const center = map.getCenter();
    setMapCenter([center.lat, center.lng]);
  });

  return null;
};

const TrackLine = ({ entity }) => {
  const { id, track } = entity;
  if (!track || track.length < 2) {
    return null;
  }
  let lastPosition = null;
  let segmentNumber = 0;
  const segments = track.map((position) => {
    if (!lastPosition) {
      lastPosition = position;
      return null;
    }
    const result = (
      <Polyline
        key={`${id}-${segmentNumber++}`}
        positions={[
          [lastPosition.lat, lastPosition.lon],
          [position.lat, position.lon],
        ]}
        color={"red"}
      />
    );
    lastPosition = position;
    return result;
  });
  return segments;
};

const MapView = (props) => {
  const { entities, activeEntityId, setActiveEntityId } = useContext(
    DataHubContext
  );
  const { mapCenter, zoomLevel } = useContext(PreferencesContext);

  const markers = Object.values(entities)
    .map((entity) => {
      const { type, id, lat, lon } = entity;
      if (!lat || !lon) {
        return null;
      }
      let icon;
      if (type === "ADSB") {
        icon = PlaneIcon(entity.aircraftInfo);
      } else if (type === "AIS") {
        icon = BoatIcon(entity.shipInfo.aisData);
      } else {
        return null;
      }

      // Dim inactive entities if one is selected.
      const isActiveEntity = activeEntityId === id;
      const opacity = (isActiveEntity || !activeEntityId) ? 1.0 : 0.6;

      return (
        <React.Fragment key={id}>
          <Marker
            position={[lat, lon]}
            icon={icon}
            opacity={opacity}
            eventHandlers={{
              popupopen: (e) => {
                setActiveEntityId(id);
              },
              popupclose: (e) => {
                if (activeEntityId === id) {
                  setActiveEntityId(null);
                }
              },
            }}
          >
            <Popup>
              <EntityPopup entity={entity} />
            </Popup>
          </Marker>
          {id === activeEntityId && <TrackLine entity={entity} />}
        </React.Fragment>
      );
    })
    .filter(Boolean);

  return (
    <div className={`map-zoom-${zoomLevel}`}>
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
