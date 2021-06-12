import React, { memo, useEffect, useRef, useState } from "react";
import { Chart } from "frappe-charts";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const Daily: React.FC<ChartProps> = ({
  selectedPref,
  chartAttrs,
  previousVaccineToggle,
  style,
}) => {
  const [dailyChart, setDailyChart] = useState<any>();

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/vaccines/${selectedPref}/new${previousVaccineToggle}`
      )
      .then(function (resp: any) {
        const chart = new Chart(".daily", {
          data: { ...resp.data },
          ...chartAttrs,
        });
        setDailyChart(chart);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/vaccines/${selectedPref}/new${previousVaccineToggle}`
      )
      .then(function (resp: any) {
        if (dailyChart !== undefined) {
          dailyChart.update(resp.data);
        }
      });
  }, [selectedPref, previousVaccineToggle]);

  return <div className="daily" style={style}></div>;
};

export default memo(Daily);
