require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 SkillBridge CUET API running on port ${PORT}`);
  });
};

start();

// Graceful shutdown on unhandled errors.
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled rejection:", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught exception:", err);
  process.exit(1);
});
