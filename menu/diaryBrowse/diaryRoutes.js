const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Diary = require(path.join(__dirname, './diary.js'));
const router = express.Router();
const secretKey = 'ncku';

// Set up multer disk storage configuration
const storage = multer.diskStorage({
    // Specify the destination directory for file uploads
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../personal/image')); // Ensure this directory exists or is created before uploading files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Using the current timestamp and the original file extension as the file name
    }
});

const upload = multer({ storage: storage });

router.post('/diary', upload.single('image'), async (req, res) => {
    try {
        const { date, text, weatherText } = req.body; // Extract date, text, and weatherText from the request body
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.username;

        // Format the date for consistency
        const formattedDate = new Date(date);

        // Determine the image URL if an image is uploaded
        const imageUrl = req.file ? `./personal/image/${req.file.filename}` : '';

        // Create a new diary entry
        const newDiary = new Diary({
            userId,
            weatherText,
            text,
            imageUrl,
            createdAt: formattedDate // Use the provided date
        });

        // Save the new diary entry to MongoDB
        await newDiary.save();

        res.status(201).json(newDiary); // Send a successful response with the new diary data
    } catch (error) {
        console.error("Error saving diary:", error);
        res.status(500).json({ message: "Error saving diary: " + error.message });
    }
});


router.get('/diary', async (req, res) => {
    const sortOrder = req.query.sort || 'asc';
    const sortOptions = sortOrder === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    console.log("Sort order:", sortOrder);

    try {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.username;

        // Fetch diaries from MongoDB based on the userId and sort them
        const diaries = await Diary.find({ userId: userId }).sort(sortOptions);
        console.log('diary:', diaries);

        res.json(diaries);
    } catch (error) {
        console.error("Error fetching diaries:", error);
        res.status(500).json({ message: "Error fetching diaries" });
    }
});


router.delete('/diary/:id', async (req, res) => {
    // Extract the diary ID from the request parameters
    const diaryId = req.params.id;
    console.log('diaryID:', diaryId);

    try {
        // Check if the diary entry exists
        const diary = await Diary.findById(diaryId);
        if (!diary) {
            return res.status(404).json({ message: 'Diary not found' });
        }
        console.log('Diary:', diary);

        // Delete the diary entry from the database
        await Diary.deleteOne({ _id: diaryId });

        res.status(200).json({ message: 'Diary deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error deleting diary: ' + error.message });
    }
});

router.put('/diary/:id', upload.single('image'), async (req, res) => {
    const diaryId = req.params.id;
    console.log('Updating diary ID:', diaryId);

    try {
        const { text, date, weather } = req.body; // Extract date, text, and weatherText from the request body
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        const decoded = jwt.verify(token, secretKey);
        const userId = decoded.username;

        const updatedData = {
            text: text,
            createdAt: new Date(date), // Format the date
            weatherText: weather
        };

        // Update the image URL if a new image is uploaded
        if (req.file) {
            updatedData.imageUrl = `./personal/image/${req.file.filename}`;
        }

        // Update the diary entry in the database
        const updatedDiary = await Diary.findOneAndUpdate({ _id: diaryId, userId: userId }, updatedData, { new: true });
        if (!updatedDiary) {
            return res.status(404).json({ message: 'Diary not found or user not authorized to update' });
        }

        console.log('Diary updated:', updatedDiary);
        res.status(200).json(updatedDiary);
    } catch (error) {
        console.error('Error updating diary:', error);
        res.status(500).json({ message: 'Error updating diary: ' + error.message });
    }
});

module.exports = router;