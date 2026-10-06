const mongoose = require("mongoose");

// Cached across invocations so warm serverless instances reuse the connection.
let connectionPromise = null;

/**
 * Establish (or reuse) a connection to MongoDB using MONGODB_URI.
 * Throws on failure instead of exiting, so a serverless instance survives and
 * the next request can retry.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
      .then((conn) => {
        console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error(`❌ MongoDB connection error: ${error.message}`);
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;