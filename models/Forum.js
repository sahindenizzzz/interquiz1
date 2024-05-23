const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    username: { type: String, required: true },
    date: { type: Date, default: Date.now },
    comments: [
        {
            username: String,
            comment: String,
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('Forum', forumSchema);
