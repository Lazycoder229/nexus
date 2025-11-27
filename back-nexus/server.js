import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // ✅ ESM import

import departmentRoutes from "./routes/departmentRoutes.js"; // your route file
import courseRoutes from "./routes/courses.routes.js"; // your route file
import programRoutes from "./routes/programs.routes.js"; // programs route file
import academicPeriodRoutes from "./routes/academicPeriods.routes.js"; // academic periods route file
import prerequisiteRoutes from "./routes/prerequisites.routes.js"; // prerequisites route file
import userRoutes from "./routes/user.routes.js"; // user management routes
import enrollmentRoutes from "./routes/enrollments.routes.js"; // enrollment routes
import admissionRoutes from "./routes/admissions.routes.js"; // admissions routes
import courseTransferRoutes from "./routes/courseTransfers.routes.js"; // course transfer routes
import academicHistoryRoutes from "./routes/academicHistory.routes.js"; // academic history routes
import clearanceRoutes from "./routes/clearances.routes.js"; // clearance routes
import facultyRoutes from "./routes/faculty.routes.js"; // faculty management routes
import facultyCourseAssignmentRoutes from "./routes/facultyCourseAssignment.routes.js"; // faculty course assignments
import facultyAdvisoryRoutes from "./routes/facultyAdvisory.routes.js"; // faculty advisory assignments
import facultyEvaluationRoutes from "./routes/facultyEvaluation.routes.js"; // faculty evaluations
import facultyScheduleRoutes from "./routes/facultySchedule.routes.js"; // faculty schedules

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

app.use("/api", userRoutes); // New structured user management routes
app.use("/api/dept", departmentRoutes);
app.use("/api/course", courseRoutes);
app.use("/api", programRoutes);
app.use("/api", academicPeriodRoutes);
app.use("/api", prerequisiteRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", admissionRoutes);
app.use("/api", courseTransferRoutes);
app.use("/api", academicHistoryRoutes);
app.use("/api", clearanceRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/faculty-assignments", facultyCourseAssignmentRoutes);
app.use("/api/faculty-advisory", facultyAdvisoryRoutes);
app.use("/api/faculty-evaluations", facultyEvaluationRoutes);
app.use("/api/faculty-schedules", facultyScheduleRoutes);
// import bcrypt from "bcrypt";

// bcrypt.hash("admin123", 10).then((hash) => console.log(hash));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
