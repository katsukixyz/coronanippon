import React, { memo, useEffect, useState } from "react";
import FrappeChart from "../FrappeChart";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const DailyNew: React.FC<ChartProps> = ({ selectedPref, style }) => {
  const [dailyNewData, setDailyNewData] = useState<ServerResp>();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/vaccines/${selectedPref}/newnumber`)
      .then(function (resp: any) {
        setDailyNewData(resp.data);
      });
  }, [selectedPref]);

  const chartAttributes = {
    data: {
      ...dailyNewData,
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
    <div className="dailyNew" style={style}>
      {dailyNewData ? (
        <FrappeChart parent="dailyNewChart" {...chartAttributes} />
      ) : null}
    </div>
  );
};

export default memo(DailyNew);
