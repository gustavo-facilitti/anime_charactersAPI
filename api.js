const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db");

//middlewares
app.use(express.json());
app.use(cors());

//GET ALL REQUEST
app.get("/characters", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM characters");
    return res.status(201).send(result.rows);
  } catch (error) {
    return res.status(400).send({ data: error.message });
  }
});

//GET REQUEST FROM QUERY (NAME)
app.get("/search", async (req, res) => {
  const searchParam = req.query.search; // Extract the search parameter from the query string

  if (!searchParam) {
    return res.status(400).json({ error: "Search parameter is required" });
  }

  try {
    // Query the database using the search parameter
    const result = await db.query(
      "SELECT * FROM characters WHERE name ILIKE $1",
      [`%${searchParam}%`]
    );

    if (result.rowCount === 0) {
      return res.json({ data: "no matches found..." });
    }

    // Send the query results back to the client
    res.json(result.rows);
  } catch (err) {
    console.error("Database query error:", err);
    res
      .status(500)
      .json({ error: "An error occurred while querying the database" });
  }
});

//POST REQUEST
app.post("/new-character", async (req, res) => {
  const { name, power, race, age, isAdult } = req.body;
  console.log(req.body);
  try {
    const result = await db.query(
      "INSERT INTO characters (name,power,race, age, isAdult) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [name, power, race, age, isAdult]
    );
    return res.status(201).send(result.rows);
  } catch (error) {
    return res.status(400).send({ data: error.message });
  }
});

//DELETE REQUEST
app.delete("/characters/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const idExists = await db.query("SELECT * FROM characters WHERE id = $1", [
      id,
    ]);

    console.log(idExists);

    if (idExists.rowCount === 0) {
      console.log("not found");
      return res.status(404).send({ data: "No Success" });
    }

    const result = await db.query("DELETE FROM characters WHERE id = $1", [id]);

    return res.status(200).send(`character deleted successfully`);
  } catch (error) {
    return res.status(404).send({ data: error.message });
  }
});

const PORT = 3000;

app.listen(PORT | 3000, () => {
  console.log(`Listening on port ${PORT}`);
});
