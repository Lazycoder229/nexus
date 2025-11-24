import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // ✅ ESM import
import authRoutes from "./routes/authRoutes.js"; // your route file

dotenv.config(); // load env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, try again later",
});

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

// Security headers
app.use(helmet());

// Body parser & cookies
app.use(bodyParser.json());
app.use(cookieParser());

// Rate limiter
app.use(limiter);

// Root route
app.get("/", (req, res) => res.send("ERP Backendsdsds running"));

// Auth routes
app.use("/api/auth", authRoutes);
// import bcrypt from "bcrypt";
// const password = "admin123"; // plaintext password
// const saltRounds = 10;

// bcrypt.hash(password, saltRounds).then((hash) => {
//   console.log("Bcrypt hash:", hash);
// });
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
