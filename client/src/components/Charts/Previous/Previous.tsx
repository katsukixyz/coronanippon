import React, { memo, useEffect, useState } from "react";
import { Chart } from "frappe-charts";
import { ChartProps, ServerResp } from "../ChartTypes";

const axios = require("axios");

const Previous: React.FC<ChartProps> = ({
  selectedPref,
  chartAttrs,
  previousVaccineToggle,
  style,
}) => {
  const [previousChart, setPreviousChart] = useState<any>();

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/vaccines/${selectedPref}/${previousVaccineToggle}`
      )
      .then(function (resp: any) {
        const chart = new Chart(".previous", {
          data: { ...resp.data },
          ...chartAttrs,
        });
        setPreviousChart(chart);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/vaccines/${selectedPref}/${previousVaccineToggle}`
      )
      .then(function (resp: any) {
        if (previousChart !== undefined) {
          previousChart.update(resp.data);
        }
      });
  }, [selectedPref, previousVaccineToggle]);

  return <div className="previous" style={style}></div>;
};

export default memo(Previous);
