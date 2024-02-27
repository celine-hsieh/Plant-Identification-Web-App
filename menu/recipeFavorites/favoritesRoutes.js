const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const Recipe = require(path.join(__dirname, '../recipeBrowse/recipe.js'));
const secretKey = 'ncku';
const router = express.Router();

router.get('/getFavorited', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    console.log(token);
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.username;
    console.log(userId);

    try {
        const recipesSSS = await Recipe.find();
        const recipes = recipesSSS.filter(recipe => recipe.favorite.includes(userId));
        console.log(recipes);
        res.json(recipes);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.post('/toggleFavorite', async (req, res) => {
    const { recipeId, favorited } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.username;

    try {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Update the favorite field
        if (favorited) {
            if (!recipe.favorite.includes(userId)) {
                recipe.favorite.push(userId);
            }
        } else {
            recipe.favorite = recipe.favorite.filter(id => id !== userId);
        }
        await recipe.save();

        res.json({ message: 'Favorite status updated', favorited });
    } catch (err) {
        console.error("Error updating favorite status:", err);
        return res.status(500).send('Server error');
    }
});

module.exports = router;