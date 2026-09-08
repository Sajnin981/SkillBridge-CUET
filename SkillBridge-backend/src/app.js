const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { apiLimiter } = require("./middlewares/rateLimiter");
const { errorHandler, notFound } = require("./middlewares/error");

const app = express();

// --- Security & utility middleware ---
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigin = process.env.CLIENT_URL;
      const allowedOrigins = configuredOrigin ? [configuredOrigin] : [];
      if (!origin || allowedOrigins.includes(origin) || ["http://localhost:5173", "http://127.0.0.1:5173"].includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
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

// Uploads are served through an authenticated controller, not as public files.
app.use("/api/files", require("./routes/file.routes"));

// --- Health check ---
app.get("/health", (_req, res) =>
  res.json({ success: true, message: "SkillBridge CUET API is running", data: {} })
);

// --- API routes ---
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/company", require("./routes/company.routes"));
app.use("/api/companies", require("./routes/publicCompany.routes"));
app.use("/api/opportunities", require("./routes/opportunity.routes"));
app.use("/api/faqs", require("./routes/faq.routes"));
app.use("/api", require("./routes/application.routes"));
app.use("/api/messages", require("./routes/message.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/search", require("./routes/search.routes"));

// --- 404 + centralized error handler ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
