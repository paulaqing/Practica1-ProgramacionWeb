const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const JWT_SECRET = 'tu_clave_secreta';

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/portalProductos', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB conectado'))
  .catch(err => console.log(err));

// Modelos
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['user','admin'], default: 'user' }
}));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Registro
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Datos incompletos' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Usuario ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: role || 'user' });
    await user.save();

    res.json({ message: 'Usuario registrado exitosamente' });
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Middleware para JWT en API REST
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Ruta protegida de ejemplo
app.get('/profile', authenticateToken, (req, res) => {
    res.json({ username: req.user.username, role: req.user.role });
});

// --- SOCKET.IO con JWT ---
const messageHistory = [];

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return next(new Error("Authentication error"));
        socket.user = user;
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`Usuario ${socket.user.username} conectado`);
    socket.emit('messageHistory', messageHistory);

    socket.on('chatmessage', (msg) => {
        const message = {
            name: socket.user.username,
            msg,
            timestamp: new Date().toLocaleTimeString()
        };
        messageHistory.push(message);
        io.emit('chatmessage', message);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario ${socket.user.username} desconectado`);
    });
});

// Servir index.html por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

server.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
