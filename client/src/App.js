import React, { useState } from "react";
import LogoHeader from "./components/LogoHeader";
import JapanMap from "./components/JapanMap";
import ReactTooltip from "react-tooltip";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="content">
        <LogoHeader />
        <JapanMap />
        <p>JEOJOEJOEJOJEOJEOJOEOEJO</p>
      </div>
    </div>
  );
}

export default App;
