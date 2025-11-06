const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateJWT, authorizeRole } = require('../middleware/authenticateJWT');

// Obtener todos los productos (todos los usuarios pueden ver)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Crear producto (solo admin)
router.post('/', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { name, description, price } = req.body;
  if (!name || price === undefined) return res.status(400).json({ message: 'Faltan datos' });

  try {
    const product = new Product({ name, description, price });
    await product.save();
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Editar producto (solo admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado correctamente' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
