import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Allowed Origins Setup (Local + Production Vercel URL)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Dynamic CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy error: Origin not allowed"));
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Chatify Backend is running 🚀",
  });
});

// Production Static Assets (Agar monorepo setup ho)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Server Listen
server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});