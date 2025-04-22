// config/conn.js
import mongoose from "mongoose";

let isConnectedBefore = false;

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);

  const connect = async () => {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log("✅ MongoDB connected");
      isConnectedBefore = true;
    } catch (err) {
      console.error("❌ Initial MongoDB connection error:", err);
      if (!isConnectedBefore) process.exit(1);
    }
  };

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    if (!isConnectedBefore) connect();
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB error:", err);
  });

  await connect();
};