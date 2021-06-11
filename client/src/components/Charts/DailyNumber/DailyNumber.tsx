import React, { memo, useEffect, useState } from "react";
import FrappeChart from "../FrappeChart";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const DailyNumber: React.FC<ChartProps> = ({ selectedPref, style }) => {
  const [dailyNumberData, setDailyNumberData] = useState<ServerResp>();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/vaccines/${selectedPref}/newnumber`)
      .then(function (resp: any) {
        setDailyNumberData(resp.data);
      });
  }, [selectedPref]);

  const chartAttributes = {
    data: {
      ...dailyNumberData,
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
    <div className="dailyNumber" style={style}>
      {dailyNumberData ? (
        <FrappeChart parent="dailyNumberChart" {...chartAttributes} />
      ) : null}
    </div>
  );
};

export default memo(DailyNumber);
