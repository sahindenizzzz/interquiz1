const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  quizResults: [
    {
      category: String,
      difficulty: String,
      score: Number,
      correctAnswers: Number,
      wrongAnswers: Number,
      questions: [
        {
          questionText: String,
          selectedAnswer: String,
          correctAnswer: String,
          isCorrect: Boolean
        }
      ],
      date: { type: Date, default: Date.now }
    }
  ],
  points: { type: Number, default: 0 }, // Kullanıcı puanları
  level: { type: Number, default: 1 } // Kullanıcı seviyesi
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    const document = this;
    bcrypt.hash(document.password, 10, (err, hashedPassword) => {
      if (err) {
        next(err);
      } else {
        document.password = hashedPassword;
        next();
      }
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
