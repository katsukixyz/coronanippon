import React, { memo } from "react";
import { Switch } from "@headlessui/react";
import "../../App.css";

interface ToggleProps {
  previousVaccineToggle: string;
  setPreviousVaccineToggle: React.Dispatch<React.SetStateAction<string>>;
}

const Toggle: React.FC<ToggleProps> = ({
  previousVaccineToggle,
  setPreviousVaccineToggle,
}) => {
  const enabled = previousVaccineToggle === "number" ? false : true;
  return (
    <div className="py-16">
      <Switch
        checked={enabled}
        onChange={(bool) =>
          bool
            ? setPreviousVaccineToggle("percentage")
            : setPreviousVaccineToggle("number")
        }
        className={`bg-gray-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span
          aria-hidden="true"
          className={`${enabled ? "translate-x-5" : "translate-x-0"}
           bg-white pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
        />
      </Switch>
    </div>
  );
};

export default memo(Toggle);
