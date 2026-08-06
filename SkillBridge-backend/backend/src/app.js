const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");

const { apiLimiter } = require("./middlewares/rateLimiter");
const { errorHandler, notFound } = require("./middlewares/error");

const app = express();

// --- Security & utility middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(apiLimiter);

// --- Static file serving for uploads ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check ---
app.get("/health", (_req, res) =>
  res.json({ success: true, message: "SkillBridge CUET API is running", data: {} })
);

// --- API routes ---
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/company", require("./routes/company.routes"));
app.use("/api/opportunities", require("./routes/opportunity.routes"));
app.use("/api", require("./routes/application.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// --- 404 + centralized error handler ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
