const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

// Obtener todos los productos (visible para todos los usuarios autenticados)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Faltan datos' });

  try {
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json({ message: 'Producto creado', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Editar producto (solo admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const updated = await Product.findByIdAndUpdate(id, { name, price }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
