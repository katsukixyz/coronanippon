import React from "react";
import Select, { ValueType } from "react-select";
import prefOptions from "../../assets/labels/prefOptions.json";
import "../../App.css";

interface PrefSelectorProps {
  selectedPref: number;
  setSelectedPref: React.Dispatch<React.SetStateAction<number>>;
  style?: React.CSSProperties;
}

type Options = {
  label: string;
  value: number;
};

const PrefSelector: React.FC<PrefSelectorProps> = ({
  selectedPref,
  setSelectedPref,
  style,
}) => {
  const onSelectChange = (obj: ValueType<Options, false>) => {
    setSelectedPref(obj!.value);
  };

  const selectedPrefObj = prefOptions.find((e) => e.value === selectedPref)!;

  return (
    <div style={style}>
      <Select
        value={selectedPrefObj}
        styles={{
          control: (base) => ({
            ...base,
            border: 0,
            boxShadow: "none",
          }),
          option: (provided, { isSelected, isFocused }) => ({
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
        options={prefOptions}
        onChange={onSelectChange}
        defaultValue={{ label: "全国", value: 0 }}
        noOptionsMessage={() => null}
      />
    </div>
  );
};

export default PrefSelector;
