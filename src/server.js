const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { authenticateSocket } = require('./middleware/authenticateJWT');
const { PORT, MONGO_URI } = require('./config');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- Middleware global ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

// --- Conexión a MongoDB ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// --- Rutas ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// --- Servir frontend ---
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// --- Socket.IO con autenticación JWT ---
io.use(authenticateSocket);
io.on('connection', (socket) => {
  console.log(`🟢 Usuario conectado: ${socket.user.username}`);

  socket.on('chat message', (msg) => {
    io.emit('chat message', `${socket.user.username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuario desconectado: ${socket.user.username}`);
  });
});

server.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
