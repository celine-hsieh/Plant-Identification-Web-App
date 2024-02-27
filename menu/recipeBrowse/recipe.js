const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    userId: String,
    favorite: [String],
    recipeName: String,
    material: String,
    procedure: String, // 存储图片的 URL
    createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', recipeSchema, 'Recipe');

module.exports = Recipe;
