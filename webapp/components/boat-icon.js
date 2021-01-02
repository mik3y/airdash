import L from "leaflet";
import Boat from "AirDash/webapp/images/boat.svg";
import ReactDOMServer from "react-dom/server";

import './boat-icon.scss'

const STYLE = {
  width: 32,
  height: 32,
};

const getStyleLabel = (aisData) => {
  switch (aisData.navigationalStatus) {
    case 'NAVIGATIONAL_STATUS_UNDERWAY_ENGINE':
    case 'NAVIGATIONAL_STATUS_UNDERWAY_SAILING':
    case 'NAVIGATIONAL_STATUS_TOWING_ASTERN':
    case 'NAVIGATIONAL_STATUS_PUSHING_AHEAD':
      return 'is-moving';
    case 'NAVIGATIONAL_STATUS_AT_ANCHOR':
      return 'is-anchored';
    case 'NAVIGATIONAL_STATUS_MOORED':
      return 'is-moored';
    case 'NAVIGATIONAL_STATUS_AIS_SART':
      return 'is-sart';
    default:
      break;
  }

  return '';
}

const BoatIcon = (aisData) => {
  const rotation = aisData.courseOverGround || 0;
  const style = {
    ...STYLE,
    transform: `rotate(${rotation}deg)`,
  };
  const styleLabel = getStyleLabel(aisData);
  const icon = L.divIcon({
    className: "custom-icon",
    popupAnchor: [16, -16],
    html: ReactDOMServer.renderToString(
      <div key={`icon-${aisData.mmsi}`} className="boat-icon">
        <Boat style={style} className={styleLabel} />
      </div>
    ),
  });
  return icon;
};

export default BoatIcon;
