import React from "react";

export interface ChartProps {
  selectedPref: number;
  previousVaccineToggle: string;
  style?: React.CSSProperties;
}

export interface ChartResp {
  data: {
    labels: string[];
    datasets: [
      {
        name: string;
        values: number[];
        chartType: string;
      }
    ];
  };
}
