const app = require("express")();
const cors = require("cors");
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "root",
  host: "db",
  database: "coronanippon_db",
  password: "root",
  port: 5432,
});
const PORT = 5000;

app.use(cors());

app.get("/joe", (req, res) => {
  res.status(200).send({
    joe: "mama",
  });
});

app.get("/vaccines/current", (req, res) => {
  pool.query(
    `
    WITH first_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) AS first FROM vaccines WHERE status = 1 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture),

    second_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) AS second FROM vaccines WHERE status = 2 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture),

    grouped_table AS (SELECT first_table.prefecture, first_table.first, second_table.second FROM first_table LEFT JOIN second_table ON first_table.prefecture = second_table.prefecture ORDER BY prefecture),

    pop_table AS (SELECT grouped_table.prefecture, grouped_table.first, grouped_table.second, prefectures.population FROM grouped_table INNER JOIN prefectures ON grouped_table.prefecture = prefectures.id ORDER BY prefecture)

    SELECT pop_table.prefecture, pop_table.first/pop_table.population::float AS first, pop_table.second/pop_table.population::float AS second FROM pop_table ORDER BY prefecture
    `,
    (err, result) => {
      if (err) {
        console.log(err);
        throw err;
      } else {
        const out = result.rows.reduce((acc, cur) => {
          const { prefecture, ...vaccineInfo } = cur;
          acc[cur.prefecture] = { ...vaccineInfo };
          return acc;
        }, {});
        res.status(200).json(out);
      }
    }
  );
});

app.get("/vaccines/:pref/:type", (req, res) => {
  const { pref, type } = req.params;

  if (type === "number") {
    let query = new String();
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
        const out = result.rows;
        res.status(200).json(out);
      }
    });
  } else if (type === "percentage") {
    //joe
  } else if (type === "newnumber") {
    let query = new String();
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
        const out = result.rows;
        res.status(200).json(out);
      }
    });
  }
});

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}/`));
