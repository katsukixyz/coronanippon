import React, { memo, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import JapanPref from "../assets/japan_pref.json";

const axios = require("axios");

function addFill(mapData, hexArr) {
  let updatedFill = {};
  for (let key of Object.keys(mapData)) {
    const first = mapData[key].first * 100;
    let fill = new String();
    if (first < 2) {
      fill = hexArr[0];
    } else if (first < 5) {
      fill = hexArr[1];
    } else if (first < 10) {
      fill = hexArr[2];
    } else if (first < 20) {
      fill = hexArr[3];
    } else if (first < 30) {
      fill = hexArr[4];
    } else if (first < 40) {
      fill = hexArr[5];
    } else {
      fill = hexArr[6];
    }
    updatedFill[key] = { ...mapData[key] };
    updatedFill[key].fill = fill;
  }
  return updatedFill;
}

function JapanMap() {
  const [mapData, setMapData] = useState({});
  const [tooltip, setTooltip] = useState("");
  const [geoCode, setGeoCode] = useState("");

  const hexArr = [
    "#e7f6d6",
    "#ace0a2",
    "#7bc777",
    "#52ab53",
    "#308f35",
    "#147219",
    "#005600",
  ];

  useEffect(() => {
    axios
      .get("http://localhost:5000/vaccines/current")
      .then(function (resp) {
        setMapData(addFill(resp.data, hexArr));
      })
      .catch(function (err) {
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
                    // fill = {}
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
              <li>1回: {(mapData[geoCode].first * 100).toFixed(2)}%</li>
              <li>2回: {(mapData[geoCode].second * 100).toFixed(2)}%</li>
            </ul>
          </>
        ) : (
          ""
        )}
      </ReactTooltip>
    </div>
  );
}

export default memo(JapanMap);
