const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', categorySchema);