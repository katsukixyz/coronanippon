import React from "react";

export interface ChartProps {
  selectedPref: number;
  style?: React.CSSProperties;
}

export interface ServerResp {
  labels: string[];
  datasets: [
    {
      name: string;
      values: number[];
      chartType: string;
    }
  ];
}
