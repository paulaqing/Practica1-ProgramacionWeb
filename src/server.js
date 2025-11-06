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

// ====== Configuración del servidor ======
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const messageHistory = []; // Historial de chat

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

// ====== Middleware de autenticación para sockets ======
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

// ====== Lógica del chat ======
io.on('connection', (socket) => {
  const username = socket.user?.username || 'Anónimo';
  console.log(`🟢 ${username} conectado`);

  // Enviar historial previo solo al usuario que se conecta
  socket.emit('messageHistory', messageHistory);

  // Escuchar nuevos mensajes
  socket.on('chatmessage', (msg) => {
    if (!msg || !socket.user) return;
    const message = {
      name: socket.user.username,
      msg,
      timestamp: new Date().toLocaleTimeString()
    };
    console.log(`[CHAT] ${message.name}: ${message.msg}`);
    messageHistory.push(message);
    io.emit('chatmessage', message); // Broadcast global
  });

  socket.on('disconnect', () => {
    console.log(`🔴 ${username} desconectado`);
  });
});

// ====== Inicio del servidor ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
