const app = require("express")();
const cors = require("cors");
const PORT = 5000;

app.use(cors());

app.get("/joe", (req, res) => {
  res.status(200).send({
    joe: "mama",
  });
});

app.listen(PORT, () => console.log(`Listening on localhost:${PORT}/`));
