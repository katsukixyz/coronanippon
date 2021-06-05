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

app.get("/testdb", (req, res) => {
  pool.query("SELECT * FROM prefectures", (err, result) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.status(200).json(result.rows);
  });
});

app.get("/vaccines/current", (req, res) => {
  pool.query(
    `
    WITH first_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) / (SELECT prefectures.population FROM prefectures WHERE prefectures.id = vaccines.prefecture) AS first FROM vaccines WHERE vaccines.status = 1 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture),

    second_table AS (SELECT vaccines.prefecture, SUM(vaccines.count) / (SELECT prefectures.population FROM prefectures WHERE prefectures.id = vaccines.prefecture) AS second FROM vaccines WHERE vaccines.status = 2 GROUP BY vaccines.prefecture ORDER BY vaccines.prefecture)

    SELECT first_table.prefecture, first_table.first, second_table.second FROM first_table INNER JOIN second_table ON first_table.prefecture = second_table.prefecture;
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
        // const out = result.rows;
        res.status(200).json(out);
      }
    }
  );
});

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}/`));
