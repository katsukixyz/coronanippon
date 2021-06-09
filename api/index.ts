import express from "express";
import cors from "cors";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { Pool } from "pg";

const app = express();
const pool = new Pool({
  user: "root",
  host: "db",
  database: "coronanippon_db",
  password: "root",
  port: 5432,
});
const PORT = 5000;

app.use(cors({ origin: "http://localhost:3000" }));

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

      SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date`;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
      WITH grouped_first AS (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) as first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),

      grouped_second AS (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) as second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),

      first_table AS (SELECT grouped_first.date, SUM(grouped_first.first) OVER (PARTITION BY grouped_first.prefecture ORDER BY grouped_first.date) AS first  FROM grouped_first ORDER BY grouped_first.date),

      second_table AS (SELECT grouped_second.date, SUM(grouped_second.second) OVER (PARTITION BY grouped_second.prefecture ORDER BY grouped_second.date) AS second FROM grouped_second ORDER BY grouped_second.date)

      SELECT first_table.date, first_table.first, COALESCE(second_table.second, 0) AS second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY date`;
      }

      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const labels = data.map((e) =>
            dayjs(e.date).locale("ja").format("M/D")
          );
          const firstValues = data.map((e) => parseInt(e.first));
          const secondValues = data.map((e) => parseInt(e.second));

          const datasets = [
            {
              name: "1回",
              values: firstValues,
              chartType: "line",
            },
            {
              name: "2回",
              values: secondValues,
              chartType: "line",
            },
          ];

          res.status(200).json({ labels: labels, datasets: datasets });
        }
      });
    } else if (type === "percentage") {
      let query: string = "";
      if (pref === "0") {
        query = `
        WITH grouped_first as (SELECT vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.date ORDER BY vaccines.date),

        grouped_second as (SELECT vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.date ORDER BY vaccines.date),

        first_table AS (SELECT grouped_first.date, SUM(grouped_first.first) OVER (ORDER BY grouped_first.date) AS first FROM grouped_first ORDER BY grouped_first.date),
        
        second_table AS (SELECT grouped_second.date, SUM(grouped_second.second) OVER (ORDER BY grouped_second.date) AS second FROM grouped_second ORDER BY grouped_second.date),

        grouped_table AS (SELECT first_table.date, first_table.first, second_table.second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY first_table.date),

        pop_table AS (SELECT grouped_table.date, grouped_table.first, COALESCE(grouped_table.second, 0) AS second, (SELECT SUM(prefectures.population) FROM prefectures) AS population FROM grouped_table ORDER BY grouped_table.date)

        SELECT pop_table.date, 100*pop_table.first/pop_table.population::float AS first, 100*pop_table.second/pop_table.population::float AS second FROM pop_table ORDER BY date 
        `;
      } else if (parseInt(pref) <= 47 && parseInt(pref) >= 1) {
        query = `
        WITH grouped_first as (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) AS first FROM vaccines WHERE vaccines.status = 1 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),

        grouped_second as (SELECT vaccines.prefecture, vaccines.date, SUM(vaccines.count) AS second FROM vaccines WHERE vaccines.status = 2 AND vaccines.prefecture = ${pref} GROUP BY vaccines.prefecture, vaccines.date ORDER BY vaccines.date),

        first_table AS (SELECT grouped_first.prefecture, grouped_first.date, SUM(grouped_first.first) OVER (PARTITION BY grouped_first.prefecture ORDER BY grouped_first.date) AS first FROM grouped_first ORDER BY grouped_first.date),
        
        second_table AS (SELECT grouped_second.prefecture, grouped_second.date, SUM(grouped_second.second) OVER (PARTITION BY grouped_second.prefecture ORDER BY grouped_second.date) AS second FROM grouped_second ORDER BY grouped_second.date),

        grouped_table AS (SELECT first_table.prefecture, first_table.date, first_table.first, second_table.second FROM first_table LEFT JOIN second_table ON first_table.date = second_table.date ORDER BY first_table.date),

        pop_table AS (SELECT grouped_table.date, grouped_table.first, COALESCE(grouped_table.second, 0) as second, prefectures.population FROM grouped_table INNER JOIN prefectures ON grouped_table.prefecture = prefectures.id ORDER BY grouped_table.date)

        SELECT pop_table.date, 100*pop_table.first/pop_table.population::float AS first, 100*pop_table.second/pop_table.population::float AS second FROM pop_table ORDER BY pop_table.date
        `;
      }
      pool.query(query, (err, result) => {
        if (err) {
          console.log(err);
          throw err;
        } else {
          const data = result.rows;
          const labels = data.map((e) =>
            dayjs(e.date).locale("ja").format("M/D")
          );
          const firstValues = data.map((e) => e.first.toFixed(2));
          const secondValues = data.map((e) => e.second.toFixed(2));

          const datasets = [
            {
              name: "1回",
              values: firstValues,
              chartType: "line",
            },
            {
              name: "2回",
              values: secondValues,
              chartType: "line",
            },
          ];
          res.status(200).json({ labels: labels, datasets: datasets });
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
          const labels = data.map((e) =>
            dayjs(e.date).locale("ja").format("M/D")
          );
          const firstValues = data.map((e) => parseInt(e.first));
          const secondValues = data.map((e) => parseInt(e.second));

          const datasets = [
            {
              name: "1回",
              values: firstValues,
              chartType: "line",
            },
            {
              name: "2回",
              values: secondValues,
              chartType: "line",
            },
          ];

          res.status(200).json({ labels: labels, datasets: datasets });
        }
      });
    }
  }
);

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}/`));
