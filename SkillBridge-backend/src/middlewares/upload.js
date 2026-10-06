const multer = require("multer");
const AppError = require("../utils/AppError");
const fileStore = require("../utils/fileStore");

// Map each form field name to its destination folder + allowed MIME types.
const FIELD_MAP = {
  idCard: { folder: "student-ids", types: ["image/jpeg", "image/png", "image/webp", "application/pdf"] },
  resume: { folder: "resumes", types: ["application/pdf"] },
  avatar: { folder: "avatars", types: ["image/jpeg", "image/png", "image/webp"] },
  logo: { folder: "company-logos", types: ["image/jpeg", "image/png", "image/webp"] },
  tradeLicense: { folder: "trade-licenses", types: ["image/jpeg", "image/png", "image/webp", "application/pdf"] },
  postImage: { folder: "post-images", types: ["image/jpeg", "image/png", "image/webp"] },
};

// Files are kept in memory and then persisted to MongoDB (see utils/fileStore.js),
// because serverless platforms have no writable persistent disk.
const storage = multer.memoryStorage();

const maxBytes = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const cfg = FIELD_MAP[file.fieldname];
  if (!cfg) return cb(new AppError(`Unknown upload field: ${file.fieldname}`, 400));
  if (!cfg.types.includes(file.mimetype)) {
    return cb(new AppError(`File type ${file.mimetype} is not allowed for ${file.fieldname}.`, 400));
  }
  cb(null, true);
};

const multerInstance = multer({ storage, fileFilter, limits: { fileSize: maxBytes } });

// Persist every uploaded file and expose `file.filename` / `file.folder` exactly
// as multer's disk storage used to, so controllers keep building the same URLs.
const persistFiles = async (req, _res, next) => {
  try {
    const files = [];
    if (req.file) files.push(req.file);
    if (Array.isArray(req.files)) files.push(...req.files);
    else if (req.files) Object.values(req.files).forEach((list) => files.push(...list));

    for (const file of files) {
      const cfg = FIELD_MAP[file.fieldname];
      file.filename = fileStore.buildFilename(file.fieldname, file.originalname);
      file.folder = cfg.folder;
      await fileStore.save(cfg.folder, file.filename, file.buffer, file.mimetype);
      file.buffer = undefined;
    }
    next();
  } catch (err) {
    next(err);
  }
};

const upload = {
  single: (name) => [multerInstance.single(name), persistFiles],
  fields: (fields) => [multerInstance.fields(fields), persistFiles],
};

module.exports = { upload, FIELD_MAP };
