import React, { useState, useEffect } from "react";
import LogoHeader from "./components/LogoHeader/LogoHeader";
import JapanMap, { MapData, addFill } from "./components/JapanMap/JapanMap";
import { HexArr } from "./components/ColorScale/ColorScale";
import ColorScale from "./components/ColorScale/ColorScale";
import ChartWrapper from "./components/Charts/ChartWrapper";
import PrefTable, {
  addBackgroundFill,
  TableData,
} from "./components/PrefTable/PrefTable";
import "./App.css";
import PrefSelector from "./components/PrefSelector/PrefSelector";

const axios = require("axios");

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
      .get("http://localhost:5000/vaccines/current")
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
      <div className="content">
        <LogoHeader style={{ paddingTop: "2em" }} />
        <JapanMap mapData={mapData} />
        <ColorScale />
        <PrefTable tableData={tableData} />
        <PrefSelector setSelectedPref={setSelectedPref} />
        <ChartWrapper
          selectedPref={selectedPref}
          previousVaccineToggle={previousVaccineToggle}
        />
      </div>
    </div>
  );
};

export default App;
