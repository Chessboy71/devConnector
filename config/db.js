import mongoose from "mongoose";
import config from "config";

const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log("Database is connected :D");
  } catch (err) {
    console.error("Error:", err.message);

    // exit with failure
    process.exit(1);
  }
};

export default connectDB;
