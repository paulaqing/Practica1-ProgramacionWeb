const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware para rutas HTTP
exports.authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Middleware para sockets
exports.authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token requerido'));

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Token inválido'));
    socket.user = user;
    next();
  });
};
