require("dotenv").config();
const http = require("node:http");
const app = require("./app");
const connectDB = require("./config/db");
const attachSocketServer = require("./services/socketServer");

const PORT = Number(process.env.PORT) || 8080;

const start = async () => {
  await connectDB();
  const server = http.createServer(app);
  attachSocketServer(server, app);
  server.listen(PORT, () => {
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
