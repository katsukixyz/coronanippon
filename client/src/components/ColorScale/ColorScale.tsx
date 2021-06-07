import React from "react";

export const HexArr = [
  "#e7f6d6",
  "#ace0a2",
  "#7bc777",
  "#52ab53",
  "#308f35",
  "#147219",
  "#005600",
];

const ScaleValues = [0, 2, 5, 10, 20, 30, 40, "40+"];

const ColorScale: React.FC = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {HexArr.map((color) => {
          return (
            <div
              key={color}
              style={{
                backgroundColor: color,
                width: "2em",
                height: "2em",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          // paddingLeft: "2em",
          position: "relative",
          display: "flex",
          textAlign: "center",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {ScaleValues.map((val) => {
          return <div style={{ width: "2em" }}>{val}</div>;
        })}
        <div style={{ position: "absolute", paddingLeft: "18em" }}>(%)</div>
      </div>
    </>
  );
};

export default ColorScale;
