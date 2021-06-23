import React, { memo, useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer,
} from "recharts";
import { ChartData, ChartProps, ChartResp } from "../ChartTypes";
import axios from "axios";

const Previous: React.FC<ChartProps> = ({
  selectedPref,
  previousVaccineToggle,
  style,
}) => {
  const [previousChartData, setPreviousChartData] = useState<ChartData[]>();

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_ENDPOINT}/vaccines/${selectedPref}/${previousVaccineToggle}`
      )
      .then(function (resp: ChartResp) {
        setPreviousChartData(resp.data);
      });
  }, [selectedPref, previousVaccineToggle]);

  return (
    <div
      style={{
        minWidth: "45%",
        height: 500,
        paddingBottom: "3em",
      }}
    >
      <p style={{ fontWeight: "bold", fontSize: "1.5em" }}>
        {previousVaccineToggle === "number" ? "接種数累計" : "接種率累計"}
      </p>
      <ResponsiveContainer>
        <AreaChart
          margin={{ top: 20, right: 0, left: 50 }}
          data={previousChartData}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7bc777" stopOpacity={0.8} />
              <stop offset="99%" stopColor="#7bc777" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#308f35" stopOpacity={0.8} />
              <stop offset="99%" stopColor="#308f35" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="first"
            name="1回"
            fillOpacity={1}
            stroke="#7bc777"
            fill="url(#colorUv)"
          />
          <Area
            type="monotone"
            dataKey="second"
            name="2回"
            fillOpacity={1}
            stroke="#308f35"
            fill="url(#colorUv)"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis>
            <Label
              value={previousVaccineToggle === "number" ? "人" : "%"}
              position="left"
              angle={-90}
              offset={40}
            />
          </YAxis>
          <Tooltip
            formatter={
              previousVaccineToggle === "percentage"
                ? (value: string) => value + "%"
                : (value: string) => value + "人"
            }
          />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(Previous);
