const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true } // admite decimales
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
