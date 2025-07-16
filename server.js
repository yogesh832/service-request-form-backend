// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";


// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();


// Schedulers & Reminders
// import "./utils/reminderScheduler.js";
import "./controllers/unassignedTicketReminder.js";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed Origins List
const allowedOrigins = [
  "http://localhost:5173",
  "https://salka-tech-service-request-form.vercel.app",
  "https://your-other-vercel-url.vercel.app",
  "https://service-request-jhgh.vercel.app",
];

// ✅ CORS Middleware with Dynamic Origin Check
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("❌ Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});

// ✅ Main Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/analytics", analyticsRoutes);

// ✅ Error Handler Middleware (Last)
app.use((err, req, res, next) => {
  console.error("🔥 UNCAUGHT ERROR:", err.stack || err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message || err,
  });
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
