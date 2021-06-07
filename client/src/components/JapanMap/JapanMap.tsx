import React, { memo, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import JapanPref from "../../assets/data/japan_pref.json";
import { HexArr } from "../ColorScale/ColorScale";

const axios = require("axios");

interface MapData {
  [prefecture: string]: {
    first: string;
    second: string;
    fill?: string;
  };
}

function addFill(mapData: MapData, HexArr: string[]) {
  let updatedFill: MapData = {};
  for (let key of Object.keys(mapData)) {
    const first = parseFloat(mapData[key].first) * 100;
    let fill: string;
    if (first < 2) {
      fill = HexArr[0];
    } else if (first < 5) {
      fill = HexArr[1];
    } else if (first < 10) {
      fill = HexArr[2];
    } else if (first < 20) {
      fill = HexArr[3];
    } else if (first < 30) {
      fill = HexArr[4];
    } else if (first < 40) {
      fill = HexArr[5];
    } else {
      fill = HexArr[6];
    }
    updatedFill[key] = { ...mapData[key], fill: fill };
    updatedFill[key].fill = fill;
  }
  return updatedFill;
}

const JapanMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData>({});
  const [tooltip, setTooltip] = useState("");
  const [geoCode, setGeoCode] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/vaccines/current")
      .then(function (resp: any) {
        setMapData(addFill(resp.data, HexArr));
      })
      .catch(function (err: string) {
        console.log(err);
      });
  }, []);

  return (
    <div className="map">
      <ComposableMap
        projection="geoMercator"
        height={400}
        width={600}
        projectionConfig={{ scale: 900, center: [139, 36] }}
        data-tip=""
      >
        <ZoomableGroup
          center={[0, 0]}
          translateExtent={[
            [0, 0],
            [600, 410],
          ]}
          maxZoom={3}
        >
          <Geographies
            key="prefectures"
            geography={JapanPref}
            stroke="#f4f4f4"
            strokeWidth={0.5}
          >
            {({ geographies }) =>
              geographies.map((geo) => {
                const prefCode = parseInt(
                  geo.properties.ADM1_PCODE.replace("JP", ""),
                  10
                );
                return (
                  <Geography
                    key={geo.rsmKey}
                    tabIndex={-1}
                    role="img"
                    geography={geo}
                    fill={
                      Object.keys(mapData).length !== 0
                        ? mapData[prefCode].fill
                        : "#fff"
                    }
                    onMouseEnter={() => {
                      setTooltip(geo.properties.ADM1_JA);
                      setGeoCode(prefCode.toString());
                    }}
                    onMouseLeave={() => {
                      setTooltip("");
                      setGeoCode("");
                    }}
                    style={{
                      default: {
                        outline: "none",
                      },
                      hover: {
                        outline: "none",
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <ReactTooltip>
        {tooltip && Object.keys(mapData).length !== 0 ? (
          <>
            <p>{tooltip}</p>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li>
                1回: {(parseFloat(mapData[geoCode].first) * 100).toFixed(2)}%
              </li>
              <li>
                2回: {(parseFloat(mapData[geoCode].second) * 100).toFixed(2)}%
              </li>
            </ul>
          </>
        ) : (
          ""
        )}
      </ReactTooltip>
    </div>
  );
};

export default memo(JapanMap);
