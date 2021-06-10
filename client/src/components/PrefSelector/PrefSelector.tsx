import React from "react";
import Select from "react-select";
import "../../App.css";

const PrefSelector: React.FC = () => {
  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];
  return (
    <Select
      styles={{
        control: (base) => ({
          ...base,
          border: 0,
          boxShadow: "none",
        }),
        option: (provided, { isDisabled, isSelected, isFocused }) => ({
          ...provided,
          backgroundColor: isSelected
            ? "#ace0a2"
            : isFocused
            ? "#e7f6d6"
            : "#fff",
          ":active": { ...provided[":active"], backgroundColor: "#e7f6d6" },
          color: "black",
        }),
      }}
      options={options}
    />
  );
};

export default PrefSelector;
