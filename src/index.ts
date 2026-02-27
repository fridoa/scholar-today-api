import express from "express";
import router from "./routes/api";
import docsSetup from "./docs/route";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import db from "./utils/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./utils/env";

dotenv.config();

async function init() {
  try {
    const result = await db();

    console.log("Database Status: ", result);

    const app = express();

    const allowedOrigins = env.ALLOWED_ORIGINS?.split(",") || [];

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));

    app.use(cookieParser());

    app.use(bodyParser.json());

    const { PORT } = process.env;

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running!",
        status: "success",
      });
    });

    app.use("/api/v1", router);
    docsSetup(app);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

init();
