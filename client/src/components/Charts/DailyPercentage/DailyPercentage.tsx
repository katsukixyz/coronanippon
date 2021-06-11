import React, { memo, useEffect, useState } from "react";
import FrappeChart from "../FrappeChart";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const DailyPercentage: React.FC<ChartProps> = ({ selectedPref, style }) => {
  const [dailyPercentageData, setDailyPercentageData] = useState<ServerResp>();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/vaccines/${selectedPref}/newpercentage`)
      .then(function (resp: any) {
        setDailyPercentageData(resp.data);
      });
  }, [selectedPref]);

  const chartAttributes = {
    data: {
      ...dailyPercentageData,
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
    <div className="dailyPercentage" style={style}>
      {dailyPercentageData ? (
        <FrappeChart parent="dailyPercentageChart" {...chartAttributes} />
      ) : null}
    </div>
  );
};

export default memo(DailyPercentage);
