import React, { memo, useEffect, useState } from "react";
import FrappeChart from "../FrappeChart";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const PreviousPercentage: React.FC<ChartProps> = ({ selectedPref, style }) => {
  const [previousPercentageData, setPreviousPercentageData] =
    useState<ServerResp>();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/vaccines/${selectedPref}/percentage`)
      .then(function (resp: any) {
        setPreviousPercentageData(resp.data);
      });
  }, [selectedPref]);

  const chartAttributes = {
    data: {
      ...previousPercentageData,
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
    <div className="previousPercentage" style={style}>
      {previousPercentageData ? (
        <FrappeChart parent="previousPercentageChart" {...chartAttributes} />
      ) : null}
    </div>
  );
};

export default memo(PreviousPercentage);
