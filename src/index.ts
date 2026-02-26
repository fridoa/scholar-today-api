import express from "express";
import router from "./routes/api";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import db from "./utils/database";
import cors from "cors";

dotenv.config();

async function init() {
  try {
    const result = await db();

    console.log("Database Status: ", result);

    const app = express();

    app.use(cors());

    app.use(bodyParser.json());

    const { PORT } = process.env;

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running!",
        status: "success",
      });
    });

    app.use("/api/v1", router);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

init();
