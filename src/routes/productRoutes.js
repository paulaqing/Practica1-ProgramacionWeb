const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authenticateJWT');

// Listar productos (todos los usuarios)
router.get('/', authenticateToken, async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Crear producto (solo admin)
router.post('/', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    const { name, description, price } = req.body;
    const product = new Product({ name, description, price });
    await product.save();
    res.json(product);
});

// Ver un producto
router.get('/:id', authenticateToken, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
});

// Editar producto (solo admin)
router.put('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    const { name, description, price } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { name, description, price }, { new: true });
    res.json(product);
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Producto eliminado' });
});

module.exports = router;
