// env.js
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

export const env = {
  // =========================
  // 🌐 SERVER CONFIG
  // =========================
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // =========================
  // 🔐 AUTH / JWT
  // =========================
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_change_me",

  // =========================
  // 🗄️ DATABASE CONFIG (Prisma/PostgreSQL)
  // =========================
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/dbname",

  // =========================
  // ☁️ CLOUDINARY CONFIG
  // =========================
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER || "uploads",

  // =========================
  // 🏷️ OTHER OPTIONAL KEYS
  // =========================
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  APOLLO_PLAYGROUND: process.env.APOLLO_PLAYGROUND === "true", // Boolean
  INTROSPECTION: process.env.INTROSPECTION === "false", // Boolean
}
