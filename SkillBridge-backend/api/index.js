// Vercel serverless entry point: every request is rewritten to this function
// (see vercel.json) and handled by the Express app.
const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  if (req.url !== "/health") {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({ success: false, message: "Database connection failed.", data: {} });
    }
  }
  return app(req, res);
};