const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileStore = require("./utils/fileStore");

const { apiLimiter } = require("./middlewares/rateLimiter");
const { errorHandler, notFound } = require("./middlewares/error");

const app = express();

// Behind Vercel's proxy: needed for correct client IPs (rate limiting) and secure requests.
app.set("trust proxy", 1);

// --- Security & utility middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: (origin, callback) => {
      // CLIENT_URL may hold several comma-separated origins; trailing slashes are ignored.
      const normalize = (value) => value.trim().replace(/\/+$/, "");
      const allowedOrigins = (process.env.CLIENT_URL || "").split(",").filter(Boolean).map(normalize);
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:5174",
          "http://127.0.0.1:5174",
        ].includes(origin)
      ) {
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

// Publicly safe assets. Sensitive documents remain behind /api/files authorization.
const PUBLIC_UPLOAD_FOLDERS = ["company-logos", "avatars", "post-images"];
app.get("/uploads/:folder/:filename", async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    if (!PUBLIC_UPLOAD_FOLDERS.includes(folder)) return next();
    res.set("Cache-Control", "public, max-age=86400");
    const found = await fileStore.send(res, folder, filename);
    return found ? undefined : next();
  } catch (err) {
    return next(err);
  }
});

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
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/profiles", require("./routes/profile.routes"));
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/search", require("./routes/search.routes"));

// --- 404 + centralized error handler ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
