const LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

module.exports = function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalize = (value) => value.trim().replace(/\/+$/, "");
  const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .filter(Boolean)
    .map(normalize);
  return allowedOrigins.includes(normalize(origin)) || LOCAL_ORIGINS.includes(normalize(origin));
};
