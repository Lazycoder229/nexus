import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // ✅ ESM import
import authRoutes from "./routes/authRoutes.js"; // your route file
import departmentRoutes from "./routes/departmentRoutes.js"; // your route file
import courseRoutes from "./routes/courses.routes.js"; // your route file

dotenv.config(); // load env variables

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
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
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiter
app.use(limiter);

// Root route
app.get("/", (req, res) => res.send("ERP Backendsdsds running"));

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/dept", departmentRoutes);
app.use("/api/course", courseRoutes);
// import bcrypt from "bcrypt";

// bcrypt.hash("admin123", 10).then((hash) => console.log(hash));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
