import React, { useState } from "react";
import LogoHeader from "./components/LogoHeader/LogoHeader";
import JapanMap from "./components/JapanMap/JapanMap";
import ColorScale from "./components/ColorScale/ColorScale";
import "./App.css";

export interface Style {
  [style: string]: any;
}

const App: React.FC = () => {
  const [selectedPref, setSelectedPref] = useState(0);

  return (
    <div className="App">
      <div className="content">
        <LogoHeader style={{ paddingTop: "2em" }} />
        <JapanMap />
        <ColorScale />
      </div>
    </div>
  );
};

export default App;
