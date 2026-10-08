import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import pool from "./config/db.js";

import siteRoutes from "./routes/siteRoutes.js";
import installationRoutes from "./routes/installationRoutes.js";
import summaryRoutes from "./routes/summaryRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// ====================
// Middleware
// ====================

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ====================
// Health Check
// ====================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Site Operations API is running",
  });
});

// ====================
// Database Test
// ====================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ====================
// API Routes
// ====================

app.use("/api/sites", siteRoutes);
app.use("/api/installations", installationRoutes);
app.use("/api/summary", summaryRoutes);

// ====================
// Handle Unknown Routes
// ====================

app.use((req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
});

// ====================
// Central Error Handler
// ====================

app.use(errorHandler);

// ====================
// Start Server
// ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});