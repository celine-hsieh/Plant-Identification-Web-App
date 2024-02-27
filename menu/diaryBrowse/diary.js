const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
    // _id: { type: mongoose.Schema.Types.ObjectId },
    userId: String,
    weatherText: String,
    text: String,
    imageUrl: String, // 存储图片的 URL
    createdAt: { type: Date, default: Date.now }
});

const Diary = mongoose.model('Diary', diarySchema, 'content');

module.exports = Diary;
