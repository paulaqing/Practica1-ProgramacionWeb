const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, MONGODB_URI } = require('./config');

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Endpoints API
app.use('/', authRoutes);
app.use('/api/products', productRoutes);

// CHAT con autenticación JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = user;
    next();
  });
});

let messages = [];

io.on('connection', socket => {
  console.log(`💬 Usuario conectado: ${socket.user.username}`);
  socket.emit('messageHistory', messages);

  socket.on('chatmessage', msg => {
    const fullMsg = {
      name: socket.user.username,
      msg,
      timestamp: new Date().toLocaleTimeString()
    };
    messages.push(fullMsg);
    io.emit('chatmessage', fullMsg);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Usuario desconectado: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
