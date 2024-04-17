import express from "express";
import { createConnection } from "mysql";
import dotenv from "dotenv/config";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3050;

const table_name = process.env["DB_TABLE_NAME"];

const column_list = [
  "General_Health",
  "Checkup",
  "Exercise",
  "Heart_Disease",
  "Skin_Cancer",
  "Other_Cancer",
  "Depression",
  "Diabetes",
  "Arthritis",
  "Sex",
  "Age_Category",
  "Height",
  "Weight",
  "BMI",
  "Smoking_History",
  "Alcohol_Consumption",
  "Fruit_Consumption",
  "Green_Vegetables_Consumption",
  "FriedPotato_Consumption",
];

// Create a MySQL connection
const connection = createConnection({
  host: "localhost",
  port: 3306,
  user: process.env["DB_USER"],
  password: process.env["DB_PASSWORD"],
  database: process.env["DB_NAME"],
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.get("/count/:column", (req, res) => {
  const column = req.params.column;
  connection.query(
    `SELECT ${column}, COUNT(*) AS category_count FROM ${table_name} GROUP BY ${column};`,
    (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to fetch data" });
        return;
      }
      res.json(results);
    }
  );
});

app.get("/countAll/", async (req, res) => {
    const end_result = {};

    try {
        await Promise.all(
            column_list.map((column) => {
                return new Promise((resolve, reject) => {
                    connection.query(
                        `SELECT ${column}, COUNT(*) AS category_count FROM ${table_name} GROUP BY ${column}`,
                        (err, results) => {
                            if (err) {
                                console.error("Error executing MySQL query:", err);
                                reject(err);
                            } else {
                                end_result[column] = results;
                                resolve();
                            }
                        }
                    );
                });
            })
        );

        res.json(end_result);
    } catch (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get("/count", (req, res) => {
  connection.query(
    `SELECT COUNT(*) AS count FROM ${table_name};`,
    (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to fetch data" });
        return;
      }
      res.json(results);
    }
  );
});

app.get("/:itemNum/:page", (req, res) => {
  const page = req.params.page;
  const item_num = req.params.itemNum;

  const offset = page * item_num;

  connection.query(
    `SELECT * FROM ${table_name} LIMIT ${item_num} OFFSET ${offset};`,
    (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to fetch data" });
        return;
      }
      res.json(results);
    }
  );
});

app.post("/", (req, res) => {
  const newData = req.body;
  connection.query(
    `INSERT INTO ${table_name} SET ?`,
    newData,
    (err, result) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to create new data" });
        return;
      }
      res.json({ message: "New data created successfully" });
    }
  );
});

app.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  connection.query(
    `UPDATE ${table_name} SET ? WHERE id = ?`,
    [updatedData, id],
    (err, result) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to update data" });
        return;
      }
      res.json({ message: "Data updated successfully" });
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `DELETE FROM ${table_name} WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to delete data" });
        return;
      }
      res.json({ message: "Data deleted successfully" });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
