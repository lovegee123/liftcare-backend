// server.js (LiftCare Backend - Minimal CORS + Express)
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import specs from "./swagger.js";
import Routes from "./Auth/Auth.js";
import main from "./Routes/Core.js";
import contract from "./Routes/Contracts.js";
import maintain from "./Routes/Maintenance.js";
import parts from "./Routes/Parts.js";

dotenv.config();

// ---- Config ----
const app = express();
const PORT = process.env.PORT || 4000;

// ถ้าอยากล็อก origin ทีหลัง ค่อยใช้ตัวนี้
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// ---- Security & basic middleware ----
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- CORS แบบตัดปัญหา: จัดการเองทีเดียวทุก request ----
app.use((req, res, next) => {
  // ชั่วคราว: เปิดทุก origin จะได้ไม่ติด CORS ระหว่าง demo
  // ถ้าอยากล็อกทีหลัง เปลี่ยน "*" เป็น FRONTEND_ORIGIN ก็ได้
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // จัดการ preflight ตรงนี้เลย ไม่ไปถึง router
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ---- Health check ----
app.get("/", (req, res) => {
  res.send("🚀 LiftCare API is running...");
});

// ---- Swagger Documentation ----
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: { persistAuthorization: true },
  })
);

// ---- Routes ----
app.use("/auth", Routes);
app.use("/api", main, contract, maintain, parts);

// ---- Start ----
app.listen(PORT, () => {
  console.log(`✅ LiftCare backend running at http://localhost:${PORT}`);
  console.log(`FRONTEND_ORIGIN (unused for now): ${FRONTEND_ORIGIN}`);
});
