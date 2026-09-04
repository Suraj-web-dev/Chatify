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

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Allow Localhost + Any Vercel Deployment Link for Chatify
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chatify-3zfuocv9o-suraj-a081.vercel.app",
      /^https:\/\/chatify-.*\.vercel\.app$/, // Har ek Vercel preview domain ko allow karega
    ],
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

// Production Static Assets
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