import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import ngoRoutes from "./Routes/ngoRoutes.js";
import schoolRoutes from "./Routes/schoolRoutes.js";
import studentRoutes from "./Routes/studentRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
// Routes
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/student", studentRoutes);

// Start DB + Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));