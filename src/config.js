module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: 'mongodb://127.0.0.1:27017/portalProductos',
  JWT_SECRET: process.env.JWT_SECRET || 'secret_key'
};
