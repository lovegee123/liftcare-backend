// server.js (LiftCare Backend - Minimal CORS + Express)
import express from "express";
import cors from "cors";
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

// CORS Configuration - Clean the origin URL
let FRONTEND_ORIGIN = process.env.CORS_ORIGIN || "*";
// Remove trailing slash if present
if (FRONTEND_ORIGIN !== "*" && FRONTEND_ORIGIN.endsWith("/")) {
  FRONTEND_ORIGIN = FRONTEND_ORIGIN.slice(0, -1);
}

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
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

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
