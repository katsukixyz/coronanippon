import React from "react";

export interface ChartProps {
  selectedPref: number;
  previousVaccineToggle: string;
  chartAttrs: {
    type: string;
    colors: string[];
    axisOptions: {
      xAxisMode: string;
      xIsSeries: number;
    };
    lineOptions: {
      hideDots: number;
      spline: number;
      regionFill: number;
    };
  };
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
