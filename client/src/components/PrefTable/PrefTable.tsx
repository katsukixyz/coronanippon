import React, { memo } from "react";
import "../../App.css";

interface TableProps {
  tableData: TableData;
  style?: React.CSSProperties;
}

type TableValues = {
  pref: string;
  first: string;
  second: string;
  fill?: string;
};

type TableColumns = {
  title: string;
  key: string;
};

export interface TableData {
  data: TableValues[];
  columns: TableColumns[];
}

export function addBackgroundFill(data: TableValues[], HexArr: string[]) {
  let updatedFill: TableValues[] = data.map((row) => {
    let fill: string;
    const first = parseFloat(row.first.split("%")[0]);
    if (first < 2) {
      fill = HexArr[0];
    } else if (first < 5) {
      fill = HexArr[1];
    } else if (first < 10) {
      fill = HexArr[2];
    } else if (first < 20) {
      fill = HexArr[3];
    } else if (first < 30) {
      fill = HexArr[4];
    } else if (first < 40) {
      fill = HexArr[5];
    } else {
      fill = HexArr[6];
    }
    return {
      fill: fill,
      ...row,
    };
  });
  return updatedFill;
}

const PrefTable: React.FC<TableProps> = ({ tableData, style }) => {
  const { data, columns } = tableData;

  return (
    <div style={style}>
      <table style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {columns.map((item) => (
              <th key={item.key}>{item.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            return (
              <tr key={row.pref}>
                <td style={{ backgroundColor: row.fill }}>{row.pref}</td>
                <td>{row.first}</td>
                <td>{row.second}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default memo(PrefTable);
