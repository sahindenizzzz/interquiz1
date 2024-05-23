const express = require('express');
const router = express.Router();
const Forum = require('../models/Forum');
const verifyToken = require('../models/middleware');
const User = require('../models/User');

router.post('/create', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newPost = new Forum({
            title: req.body.title,
            content: req.body.content,
            username: user.username
        });
        await newPost.save();
        res.status(201).json({ message: 'Forum postu başarıyla oluşturuldu.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const posts = await Forum.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/comment/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const post = await Forum.findById(req.params.id);
        post.comments.push({
            username: user.username,
            comment: req.body.comment
        });
        await post.save();
        res.status(201).json({ message: 'Yorum başarıyla eklendi.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
