const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const Recipe = require(path.join(__dirname, './recipe.js'));
const secretKey = 'ncku';
const router = express.Router();

router.get('/getRecipes', async (req, res) => {
    try {
        // Fetch all recipes from the database
        const recipes = await Recipe.find();
        console.log('recipe:', recipes);
        res.json(recipes);
    } catch (err) {
        console.error("Error fetching recipes from database:", err);
        res.status(500).send('Error fetching recipes from database');
    }
});


router.post('/checkFavorite', async (req, res) => {
    const recipeId = req.body.recipeId;
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.username;

    try {
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        } else if (!userId) {
            return res.status(403).json({ message: 'user expired' });
        }

        const isFavorited = recipe.favorite.includes(userId);
        res.json({ isFavorited });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Handle other errors
        console.error("Error checking if recipe is favorited:", err);
        return res.status(500).send('Server error');
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
