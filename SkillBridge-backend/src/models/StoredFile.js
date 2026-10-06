const mongoose = require("mongoose");

/**
 * Uploaded files are stored in MongoDB because serverless platforms (Vercel)
 * have no persistent local disk. `key` mirrors the public path without the
 * "/uploads/" prefix, e.g. "avatars/avatar-123-456.png".
 */
const storedFileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, default: "application/octet-stream" },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StoredFile || mongoose.model("StoredFile", storedFileSchema);
