import React from "react";
import DailyNew from "./DailyNew/DailyNew";
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
        <PreviousNumber selectedPref={selectedPref} />
      ) : (
        <PreviousPercentage selectedPref={selectedPref} />
      )}
      <DailyNew selectedPref={selectedPref} />
    </div>
  );
};

export default ChartWrapper;
