import express from "express";
import { createConnection } from "mysql";
import dotenv from "dotenv/config";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());
const port = 3050;

const medic_table = process.env.DB_MEDIC_TABLE_NAME;
const model_stat_table = process.env.DB_MODEL_STAT_TABLE_NAME;

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
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
    `SELECT ${column}, COUNT(*) AS category_count FROM ${medic_table} GROUP BY ${column};`,
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
            `SELECT ${column}, COUNT(*) AS category_count FROM ${medic_table} GROUP BY ${column}`,
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

app.get("/modelStat", (req, res) => {
  const model_results = {};

  connection.query(`SELECT * FROM ${model_stat_table};`, (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Failed to fetch data" });
      return;
    }

    results.forEach((result) => {
      model_results[result.model_name] = {
        train_f1_score: result.train_f1_score,
        test_f1_score: result.test_f1_score,
      };
    });

    res.json(model_results);
  });
});

app.get("/dashContent", async (req, res) => {
  const count_results = {};

  try {
    await Promise.all(
      column_list.map((column) => {
        return new Promise((resolve, reject) => {
          connection.query(
            `SELECT ${column}, COUNT(*) AS category_count FROM ${medic_table} GROUP BY ${column}`,
            (err, results) => {
              if (err) {
                console.error("Error executing MySQL query:", err);
                reject(err);
              } else {
                count_results[column] = results;
                resolve();
              }
            }
          );
        });
      })
    );
  } catch (err) {
    console.error("Error executing MySQL query:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }

  const model_results = {};

  connection.query(`SELECT * FROM ${model_stat_table};`, (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Failed to fetch data" });
      return;
    }

    results.forEach((result) => {
      model_results[result.model_name] = {
        train_f1_score: result.train_f1_score,
        test_f1_score: result.test_f1_score,
      };
    });

    res.json({ count_results, model_results });
  });
});

app.get("/form/:column", async (req, res) => {
  const column = req.params.column;
  let count_results = [];

  try {
    connection.query(
      `SELECT DISTINCT ${column} FROM ${medic_table}`,
      (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
        } else {
          results.forEach((element, idx) => {
            count_results[idx] = {}

            count_results[idx]['value'] = element[column]
            count_results[idx]['label'] = element[column]
          });
        }
        res.json( count_results );
      }
    );
  } catch (err) {
    console.error("Error executing MySQL query:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/count", (req, res) => {
  connection.query(
    `SELECT COUNT(*) AS count FROM ${medic_table};`,
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
    `SELECT * FROM ${medic_table} LIMIT ${item_num} OFFSET ${offset};`,
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

app.post("/create", (req, res) => {
  const newData = req.body;
  connection.query(
    `INSERT INTO ${medic_table} SET ?`,
    newData,
    (err, result) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to create new data" });
        return;
      }
      res.json({ status: 200, message: "New data created successfully" });
    }
  );
});

app.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  connection.query(
    `UPDATE ${medic_table} SET ? WHERE id = ?`,
    [updatedData, id],
    (err, result) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Failed to update data" });
        return;
      }
      res.json({ status: 200, message: "Data updated successfully" });
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `DELETE FROM ${medic_table} WHERE id = ?`,
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

app.post('/preprocess', (req, res) => {
  

  const pythonProcess = spawn('python', ['./preprocess.py'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  pythonProcess.stdin.write(JSON.stringify(req.body));
  pythonProcess.stdin.end();


  let preprocessData = '';

  pythonProcess.stdout.on('data', (data) => {
    console.log('Python output:', data.toString());
    preprocessData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Failed to preprocess data');
      res.status(500).send('Failed to preprocess data');
    }
  });

  pythonProcess.stdout.on('end', () => {
    preprocessData = preprocessData.replace(/NaN/g, 'null');

    const jsonStartIdx = preprocessData.indexOf('{');
    const jsonEndIdx = preprocessData.indexOf('}') + 1;
    const jsonData = preprocessData.substring(jsonStartIdx, jsonEndIdx);  

    try {
      const parsedData = JSON.parse(jsonData)
      res.json(parsedData);
    } catch (error) {
      console.error('Error preprocessing data:', error);
      res.status(500).send('Failed to preprocess data');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
