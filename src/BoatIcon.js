import L from "leaflet";
import Boat from "./images/boat.svg";
import ReactDOMServer from "react-dom/server";

const STYLE = {
  width: 32,
  height: 32,
};

const BoatIcon = (vessel) => {
  const rotation = vessel.heading || 0;
  const style = {
    ...STYLE,
    transform: `rotate(${rotation}deg)`,
  };
  const icon = L.divIcon({
    className: "custom-icon",
    popupAnchor: [16, -16],
    html: ReactDOMServer.renderToString(
      <div key={`icon-${vessel.mmsi}`} className="plane-icon">
        <Boat style={style} />
      </div>
    ),
  });
  return icon;
};

export default BoatIcon;
