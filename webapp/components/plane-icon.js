import L from "leaflet";
import Plane from "AirDash/webapp/images/airplane.svg";
import ReactDOMServer from 'react-dom/server';

import './plane-icon.scss';

const STYLE = {
    width: 32,
    height: 32,
};

const ALTITUDE_LEVELS = [
  500,
  1000,
  2000,
  4000,
  6000,
  8000,
  10000,
  20000,
  30000,
  40000,
];

const getAltitudeLevel = altitude => {
  for (let [i, v] of ALTITUDE_LEVELS.entries()) {
    if (altitude < v) {
      return i;
    }
  }
  return ALTITUDE_LEVELS.length;
}

const PlaneIcon = (aircraft) => {
  const rotation = aircraft ? aircraft.track : 0;
  const style = {
      ...STYLE,
      transform: `rotate(${rotation}deg)`,
  };
  const altitude = aircraft.altGeom || 0;
  const altitudeClass = `altitude-${getAltitudeLevel(altitude)}`;
  const icon = L.divIcon({
    className: "custom-icon",
    popupAnchor: [0, -16],
    html: ReactDOMServer.renderToString((
        <div key={`icon-${aircraft.addr}`} className="plane-icon">
            <Plane style={style} className={altitudeClass} />
        </div>
    )),
  });
  return icon;
};

export default PlaneIcon;
