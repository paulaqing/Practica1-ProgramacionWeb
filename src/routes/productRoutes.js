const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

// Obtener todos los productos
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { name, price, description } = req.body;
  if (!name || price === undefined) return res.status(400).json({ message: 'Faltan datos' });

  try {
    const newProduct = new Product({ name, price: Number(price), description: description || '' });
    await newProduct.save();
    res.status(201).json({ message: 'Producto creado', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Editar producto (solo admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price: Number(price), description: description || '' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
