import React from "react";

export interface ChartProps {
  selectedPref: number;
  previousVaccineToggle: string;
  style?: React.CSSProperties;
}

export interface ChartData {
  date: string;
  first: number;
  second: number;
}

export interface ChartResp {
  [otherKeys: string]: any;
  data: ChartData[];
}
