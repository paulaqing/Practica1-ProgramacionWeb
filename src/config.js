module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/portal_productos",
  JWT_SECRET: process.env.JWT_SECRET || "clave_secreta_super_segura"
};
