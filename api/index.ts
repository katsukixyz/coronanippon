import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { Pool } from "pg";
import { connectionString } from "./pool";

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
  ssl: isProduction,
});

// app.use(cors({ origin: "http://localhost:3000" }));
app.use(cors());

app.get("/vaccines/current", (req: express.Request, res: express.Response) => {
  pool.query(
    `
    WITH first_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) AS first FROM vaccines WHERE status = 1 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture),
    second_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) AS second FROM vaccines WHERE status = 2 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture),
    grouped_table AS (SELECT first_table.prefecture, first_table.first, second_table.second FROM first_table LEFT JOIN second_table ON first_table.prefecture = second_table.prefecture ORDER BY prefecture),
    pop_table AS (SELECT grouped_table.prefecture, (SELECT name FROM prefectures WHERE grouped_table.prefecture = prefectures.id) AS name, grouped_table.first, grouped_table.second, prefectures.population FROM grouped_table INNER JOIN prefectures ON grouped_table.prefecture = prefectures.id ORDER BY prefecture)
    SELECT pop_table.prefecture, pop_table.name, 100*pop_table.first/pop_table.population::float AS first, 100*pop_table.second/pop_table.population::float AS second FROM pop_table ORDER BY prefecture
    `,
    (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      } else {
        const mapData = result.rows.reduce((acc, cur) => {
          const { prefecture, name, ...vaccineInfo } = cur;
          acc[cur.prefecture] = { ...vaccineInfo };
          return acc;
        }, {});
        const tableData = result.rows.map((e) => {
          return {
            pref: e.name,
            first: e.first.toFixed(2).toString() + "%",
            second: e.second.toFixed(2).toString() + "%",
          };
        });
        const columns = [
          { title: "都道府県名", dataIndex: "pref", key: "pref" },
          { title: "一回目接種率", dataIndex: "first", key: "first" },
          { title: "二回目接種率", dataIndex: "second", key: "second" },
        ];
        res.status(200).json({
          mapData: mapData,
          tableData: { data: tableData, columns: columns },
        });
      }
    }
  );
});

app.get(
  "/vaccines/:pref/:type",
  (req: express.Request, res: express.Response) => {
    const { pref, type } = req.params;

    if (type === "number") {
      let query: string = "";
      if (pref === "0") {
        query = `
        WITH grouped_first AS (SELECT vaccines.date, SUM(vaccines.count) as first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.date ORDER BY vaccines.date),
        grouped_second AS (SELECT vaccines.date, SUM(vaccines.count) as second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.date ORDER BY vaccines.date),
        first_table AS (SELECT grouped_first.date, SUM(grouped_first.first) OVER (ORDER BY grouped_first.date) AS first FROM grouped_first ORDER BY grouped_first.date),
        second_table AS (SELECT grouped_second.date, SUM(grouped_second.second) OVER (ORDER BY grouped_second.date) AS second FROM grouped_second ORDER BY grouped_second.date)
        SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date
        `;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
        WITH grouped_first AS (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) as first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),
        grouped_second AS (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) as second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),
        first_table AS (SELECT grouped_first.date, SUM(grouped_first.first) OVER (PARTITION BY grouped_first.prefecture ORDER BY grouped_first.date) AS first FROM grouped_first ORDER BY grouped_first.date),
        second_table AS (SELECT grouped_second.date, SUM(grouped_second.second) OVER (PARTITION BY grouped_second.prefecture ORDER BY grouped_second.date) AS second FROM grouped_second ORDER BY grouped_second.date)
        SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date
        `;
      }

      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const out = data.map((e) => ({
            date: dayjs(e.date).locale("ja").format("M/D"),
            first: parseInt(e.first),
            second: parseInt(e.second),
          }));
          res.status(200).json(out);
        }
      });
    } else if (type === "percentage") {
      let query: string = "";
      if (pref === "0") {
        query = `
        WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.date ORDER BY vaccines.date),
        second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.date ORDER BY vaccines.date),
        grouped_first AS (SELECT date, SUM(first) OVER (ORDER BY date) as first FROM first_table ORDER BY date),
        grouped_second AS (SELECT date, SUM(second) OVER (ORDER BY date) as second FROM second_table ORDER BY date),
        grouped AS (SELECT grouped_first.date, grouped_first.first, COALESCE(grouped_second.second, 0) AS second FROM grouped_first LEFT JOIN grouped_second ON grouped_first.date = grouped_second.date),
        pop_table AS (SELECT grouped.date, grouped.first, grouped.second, (SELECT SUM(population) FROM prefectures) AS population FROM grouped ORDER BY grouped.date)
        SELECT date, 100*first/population::float AS first, 100*second/population::float AS second FROM pop_table ORDER BY date
        `;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
        WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date),
        second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date),
        grouped_first AS (SELECT date, SUM(first) OVER (ORDER BY date) as first FROM first_table ORDER BY date),
        grouped_second AS (SELECT date, SUM(second) OVER (ORDER BY date) as second FROM second_table ORDER BY date),
        grouped AS (SELECT grouped_first.date, grouped_first.first, COALESCE(grouped_second.second, 0) AS second FROM grouped_first LEFT JOIN grouped_second ON grouped_first.date = grouped_second.date),
        pop_table AS (SELECT grouped.date, grouped.first, grouped.second, (SELECT SUM(population) FROM prefectures WHERE id = ${pref}) AS population FROM grouped ORDER BY grouped.date)
        SELECT date, 100*first/population::float AS first, 100*second/population::float AS second FROM pop_table ORDER BY date
        `;
      }
      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const out = data.map((e) => ({
            first: parseFloat(e.first.toFixed(2)),
            second: parseFloat(e.second.toFixed(2)),
            date: dayjs(e.date).locale("ja").format("M/D"),
          }));
          res.status(200).json(out);
        }
      });
    } else if (type === "newnumber") {
      let query: string = "";
      if (pref === "0") {
        query = `
      WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.date ORDER BY vaccines.date),
      second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.date ORDER BY vaccines.date)
      SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date
      `;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
      WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date),
      second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date)
      SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date
      `;
      }

      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const out = data.map((e) => ({
            date: dayjs(e.date).locale("ja").format("M/D"),
            first: parseInt(e.first),
            second: parseInt(e.second),
          }));
          res.status(200).json(out);
        }
      });
    } else if (type === "newpercentage") {
      let query: string = "";
      if (pref === "0") {
        query = `
        WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.date ORDER BY vaccines.date),
        second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.date ORDER BY vaccines.date),
        pop_table AS (SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second, (SELECT SUM(population) FROM prefectures) AS population FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date)
        SELECT date, 100*first/population::float AS first, 100*second/population::float AS second FROM pop_table ORDER BY date
        `;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
        WITH first_table AS (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date),
        second_table AS (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.date ORDER BY vaccines.date),
        pop_table AS (SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second, (SELECT population FROM prefectures WHERE id = ${pref}) AS population FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date)
        SELECT date, 100*first/population::float AS first, 100*second/population::float AS second FROM pop_table ORDER BY date
        `;
      }

      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const out = data.map((e) => ({
            first: parseFloat(e.first.toFixed(2)),
            second: parseFloat(e.second.toFixed(2)),
            date: dayjs(e.date).locale("ja").format("M/D"),
          }));
          res.status(200).json(out);
        }
      });
    }
  }
);

app.listen(process.env.PORT || 5000, () => console.log(`Listening.`));
