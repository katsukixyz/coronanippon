import React, { useState, useEffect } from "react";
import LogoHeader from "./components/LogoHeader/LogoHeader";
import JapanMap, { MapData, addFill } from "./components/JapanMap/JapanMap";
import ColorScale, { HexArr } from "./components/ColorScale/ColorScale";
import ChartWrapper from "./components/Charts/ChartWrapper";
import PrefTable, {
  addBackgroundFill,
  TableData,
} from "./components/PrefTable/PrefTable";
import "./App.css";
import PrefSelector from "./components/PrefSelector/PrefSelector";
import Toggle from "./components/Toggle/Toggle";
import axios from "axios";

interface ServerResp {
  [otherKeys: string]: any;
  data: {
    mapData: MapData;
    tableData: TableData;
  };
}

const App: React.FC = () => {
  const [mapData, setMapData] = useState<MapData>({});
  const [tableData, setTableData] = useState<TableData>({
    data: [],
    columns: [],
  });
  const [selectedPref, setSelectedPref] = useState(0);
  const [previousVaccineToggle, setPreviousVaccineToggle] = useState("number");

  useEffect(() => {
    axios
      .get(`https://${process.env.REACT_APP_API_ENDPOINT}/vaccines/current`)
      .then(function (resp: ServerResp) {
        setMapData(addFill(resp.data.mapData, HexArr));
        setTableData({
          data: addBackgroundFill(resp.data.tableData.data, HexArr),
          columns: resp.data.tableData.columns,
        });
      })
      .catch(function (err: string) {
        console.log(err);
      });
  }, []);

  return (
    <div className="App">
      <div className="content" style={{ paddingBottom: "2em" }}>
        <LogoHeader style={{ paddingTop: "2em" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
          }}
        >
          <div style={{ width: "50%", paddingBottom: "2em" }}>
            <JapanMap mapData={mapData} setSelectedPref={setSelectedPref} />
            <ColorScale
              style={{
                paddingTop: "1em",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            />
          </div>
          <PrefTable
            style={{
              overflowX: "auto",
              overflowY: "scroll",
              width: "18em",
              height: "34em",
            }}
            tableData={tableData}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            paddingBottom: "2em",
          }}
        >
          <PrefSelector
            style={{ minWidth: "14em", paddingRight: "2em" }}
            selectedPref={selectedPref}
            setSelectedPref={setSelectedPref}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              paddingTop: "0.5em",
            }}
          >
            <p style={{ paddingRight: "1em" }}>人</p>
            <Toggle
              previousVaccineToggle={previousVaccineToggle}
              setPreviousVaccineToggle={setPreviousVaccineToggle}
            />
            <p style={{ paddingLeft: "1em" }}>%</p>
          </div>
        </div>
        <ChartWrapper
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
          selectedPref={selectedPref}
          previousVaccineToggle={previousVaccineToggle}
        />
      </div>
    </div>
  );
};

export default App;
