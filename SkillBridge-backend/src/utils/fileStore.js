const path = require("path");
const fs = require("fs");
const StoredFile = require("../models/StoredFile");

const LEGACY_UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

const buildFilename = (prefix, originalName = "") => {
  const ext = path.extname(originalName).toLowerCase();
  return `${prefix.replace(/\s+/g, "_")}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const save = async (folder, filename, buffer, contentType) => {
  await StoredFile.create({ key: `${folder}/${filename}`, contentType, data: buffer });
};

/**
 * Remove a stored file given its public URL ("/uploads/<folder>/<filename>").
 * Also removes a legacy on-disk copy if one exists (local development).
 */
const removeByUrl = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const key = fileUrl.replace("/uploads/", "");
  await StoredFile.deleteOne({ key });
  const absolute = path.join(LEGACY_UPLOAD_ROOT, key);
  if (absolute.startsWith(LEGACY_UPLOAD_ROOT) && fs.existsSync(absolute)) {
    try {
      fs.unlinkSync(absolute);
    } catch {
      // Read-only filesystem (serverless) - nothing to clean up.
    }
  }
};

/**
 * Stream a stored file to the response. Returns false when it does not exist.
 */
const send = async (res, folder, filename) => {
  const doc = await StoredFile.findOne({ key: `${folder}/${filename}` });
  if (doc) {
    const body = Buffer.from(doc.data);
    res.set("Content-Type", doc.contentType);
    res.send(body);
    return true;
  }

  const legacyPath = path.join(LEGACY_UPLOAD_ROOT, folder, filename);
  if (fs.existsSync(legacyPath)) {
    res.type(MIME_BY_EXT[path.extname(filename).toLowerCase()] || "application/octet-stream");
    res.sendFile(legacyPath);
    return true;
  }
  return false;
};

module.exports = { buildFilename, save, removeByUrl, send };
