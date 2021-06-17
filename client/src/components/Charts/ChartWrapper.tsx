import React from "react";
import Daily from "./Daily/Daily";
import Previous from "./Previous/Previous";

interface ChartWrapperProps {
  selectedPref: number;
  previousVaccineToggle: string;
  style?: React.CSSProperties;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  selectedPref,
  previousVaccineToggle,
  style,
}) => {
  return (
    <div>
      {previousVaccineToggle ? (
        <div style={style}>
          <Previous
            selectedPref={selectedPref}
            previousVaccineToggle={previousVaccineToggle}
            style={{ maxWidth: "45%" }}
          />
          <Daily
            selectedPref={selectedPref}
            previousVaccineToggle={previousVaccineToggle}
            style={{ maxWidth: "45%" }}
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ChartWrapper;
