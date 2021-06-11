import React, { useEffect } from "react";
import { Chart } from "frappe-charts";

interface FrappeChartProps {
  parent: string;
  [chartAttributes: string]: any;
}

const FrappeChart: React.FC<FrappeChartProps> = ({
  parent,
  ...chartAttributes
}) => {
  useEffect(() => {
    new Chart(`#${parent}`, {
      ...chartAttributes,
    });
  });

  return <div id={parent} />;
};

export default FrappeChart;
