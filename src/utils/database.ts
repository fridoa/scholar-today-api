import mongoose from "mongoose";
import { env } from "./env";

const connect = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL, {
      dbName: "db-scholartoday",
    });
    return Promise.resolve("Database connected");
  } catch (error) {
    return Promise.reject("Database connection failed");
  }
};

export default connect;
