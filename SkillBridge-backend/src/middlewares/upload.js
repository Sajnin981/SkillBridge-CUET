const path = require("path");
const fs = require("fs");
const multer = require("multer");
const AppError = require("../utils/AppError");

const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

// Map each form field name to its destination folder + allowed MIME types.
const FIELD_MAP = {
  idCard: { folder: "student-ids", types: ["image/jpeg", "image/png", "image/webp", "application/pdf"] },
  resume: { folder: "resumes", types: ["application/pdf"] },
  avatar: { folder: "avatars", types: ["image/jpeg", "image/png", "image/webp"] },
  logo: { folder: "company-logos", types: ["image/jpeg", "image/png", "image/webp"] },
  tradeLicense: { folder: "trade-licenses", types: ["image/jpeg", "image/png", "image/webp", "application/pdf"] },
  postImage: { folder: "post-images", types: ["image/jpeg", "image/png", "image/webp"] },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cfg = FIELD_MAP[file.fieldname];
    if (!cfg) return cb(new AppError(`Unknown upload field: ${file.fieldname}`, 400));
    const dir = path.join(UPLOAD_ROOT, cfg.folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = file.fieldname.replace(/\s+/g, "_");
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const maxBytes = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const cfg = FIELD_MAP[file.fieldname];
  if (!cfg) return cb(new AppError(`Unknown upload field: ${file.fieldname}`, 400));
  if (!cfg.types.includes(file.mimetype)) {
    return cb(new AppError(`File type ${file.mimetype} is not allowed for ${file.fieldname}.`, 400));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: maxBytes } });

module.exports = { upload, FIELD_MAP };
