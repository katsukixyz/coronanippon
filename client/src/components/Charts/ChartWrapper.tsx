import React from "react";
import Daily from "./Daily/Daily";
import Previous from "./Previous/Previous";

interface ChartWrapperProps {
  selectedPref: number;
  previousVaccineToggle: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  selectedPref,
  previousVaccineToggle,
}) => {
  const chartAttrs = {
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
    <div>
      {previousVaccineToggle ? (
        <>
          <Previous
            selectedPref={selectedPref}
            chartAttrs={chartAttrs}
            previousVaccineToggle={previousVaccineToggle}
          />
          <Daily
            selectedPref={selectedPref}
            chartAttrs={chartAttrs}
            previousVaccineToggle={previousVaccineToggle}
          />
        </>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ChartWrapper;
