// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/conn.js";
import router from "./routes/Route.js";
import publicSessionController from "./config/sessions/publicSession.js";

dotenv.config();

const app = express();

// CORS Middleware
app.use(cors({
  origin: "https://localhost:5173/", // frontend origin
  credentials: true, // allows cookies from cross-origin
}));
app.use(express.json());
//app.use(sessionMiddleware);

//Routes adapter
app.use('/api', router); // /api

// Start the server only after DB connects
const startServer = async () => {
  try {
    await connectDB();
    // const port = process.env.PORT || 5000;
    
    // app.listen(port, () => {
    //   console.log(`🚀 Server running at http://localhost:${port}`);
    // });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Public hello endpoint
app.get("/", publicSessionController);

// Export the app as the handler
export default app;