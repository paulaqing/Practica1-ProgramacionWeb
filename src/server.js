const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { JWT_SECRET, MONGO_URI } = require('./config');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

// Middleware de autenticación para sockets
const messageHistory = []; // historial del chat en memoria

// Inicializar servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ====== Middleware general ======
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== Conexión a MongoDB ======
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB conectado'))
.catch(err => console.error('❌ Error al conectar MongoDB:', err));

// ====== Rutas ======
app.use('/', authRoutes);
app.use('/api/products', productRoutes);

// ====== Socket.IO con JWT ======
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log('❌ Conexión sin token');
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token inválido:', err.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const username = socket.user?.username || 'desconocido';
  console.log(`🟢 Usuario ${username} conectado al chat`);

  // Enviar historial previo al nuevo usuario
  socket.emit('messageHistory', messageHistory);

  // Escuchar mensajes nuevos
  socket.on('chatmessage', (msg) => {
    if (!socket.user) return;
    const message = {
      name: socket.user.username,
      msg,
      timestamp: new Date().toLocaleTimeString()
    };
    console.log(`[CHAT] ${message.timestamp} - ${message.name}: ${message.msg}`);
    messageHistory.push(message);
    io.emit('chatmessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuario ${username} desconectado`);
  });
});

// ====== Iniciar servidor ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
