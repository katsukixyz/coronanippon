import React from "react";
import DailyNumber from "./DailyNumber/DailyNumber";
import DailyPercentage from "./DailyPercentage/DailyPercentage";
import PreviousNumber from "./PreviousNumber/PreviousNumber";
import PreviousPercentage from "./PreviousPercentage/PreviousPercentage";

interface ChartWrapperProps {
  selectedPref: number;
  previousVaccineToggle: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  selectedPref,
  previousVaccineToggle,
}) => {
  return (
    <div>
      {previousVaccineToggle === "number" ? (
        <>
          <PreviousNumber selectedPref={selectedPref} />
          <DailyNumber selectedPref={selectedPref} />
        </>
      ) : (
        <>
          <PreviousPercentage selectedPref={selectedPref} />
          <DailyPercentage selectedPref={selectedPref} />
        </>
      )}
    </div>
  );
};

export default ChartWrapper;
