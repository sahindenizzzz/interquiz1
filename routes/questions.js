const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

router.get('/', async (req, res) => {
    let query = {};
    if (req.query.category) {
        query.category = req.query.category;
    }
    if (req.query.difficulty) {
        query.difficulty = req.query.difficulty;
    }

    try {
        const questions = await Question.find(query);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    try {
        const questions = await Question.find({
            $or: [
                { category: new RegExp(searchQuery, 'i') },
                { difficulty: new RegExp(searchQuery, 'i') }
            ]
        });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
