import React, { memo, useEffect, useState } from "react";
import {
  LineChart,
  Line,
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

const Daily: React.FC<ChartProps> = ({
  selectedPref,
  previousVaccineToggle,
  style,
}) => {
  const [dailyChartData, setDailyChartData] = useState<ChartData[]>();

  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_ENDPOINT}/vaccines/${selectedPref}/new${previousVaccineToggle}`
      )
      .then(function (resp: ChartResp) {
        setDailyChartData(resp.data);
      });
  }, [selectedPref, previousVaccineToggle]);

  return (
    <div
      className="dailyChart"
      style={{
        minWidth: "45%",
        height: 500,
        paddingBottom: "3em",
      }}
    >
      <p style={{ fontWeight: "bold", fontSize: "1.5em" }}>
        {previousVaccineToggle === "number"
          ? "接種数日次推移"
          : "接種率日次推移"}
      </p>
      <ResponsiveContainer>
        <LineChart
          margin={{ top: 20, right: 0, left: 50 }}
          data={dailyChartData}
        >
          <Line
            type="monotone"
            dataKey="first"
            name="1回"
            stroke="#7bc777"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="second"
            name="2回"
            stroke="#308f35"
            dot={false}
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(Daily);
