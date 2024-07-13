import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants";

async function connectDB() {
  console.clear();
  try {
    const res = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    console.log("database connected succesfully.");
    return true;
  } catch (err) {
    console.log("database connection failed :", err);
    return false;
  }
}

export { connectDB };
