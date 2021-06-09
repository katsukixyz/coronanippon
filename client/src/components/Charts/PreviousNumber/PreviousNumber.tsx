import React, { memo, useEffect, useState } from "react";
import FrappeChart from "../FrappeChart";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const PreviousNumber: React.FC<ChartProps> = ({ selectedPref, style }) => {
  const [previousNumberData, setPreviousNumberData] = useState<ServerResp>();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/vaccines/${selectedPref}/number`)
      .then(function (resp: any) {
        setPreviousNumberData(resp.data);
      });
  }, [selectedPref]);

  const chartAttributes = {
    data: {
      ...previousNumberData,
    },
    type: "line",
    colors: ["light-green", "green"],
    axisOptions: {
      xAxisMode: "tick",
      xIsSeries: 1,
    },
    lineOptions: {
      hideDots: 1,
      spline: 1,
      regionFill: 1,
    },
  };

  return (
    <div className="previousNumber" style={style}>
      {previousNumberData ? (
        <FrappeChart parent="previousNumberChart" {...chartAttributes} />
      ) : null}
    </div>
  );
};

export default memo(PreviousNumber);
