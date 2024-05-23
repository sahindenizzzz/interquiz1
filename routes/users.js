const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Nodemailer'ı dahil edin
const User = require('../models/User');
const verifyToken = require('../models/middleware');
const router = express.Router();

const checkAndAwardBadges = async (user) => {
    // Örnek rozet kontrolü ve ödüllendirmesi
    const totalCorrectAnswers = user.quizResults.reduce((sum, quiz) => sum + quiz.correctAnswers, 0);
    const allCategories = ["Sanat", "Spor", "Tarih", "Edebiyat", "Yabancı Dil", "Din Kültürü"]; // Kategorilerin tam listesi
    const completedCategories = new Set(user.quizResults.map(quiz => quiz.category));

    console.log('Total Correct Answers:', totalCorrectAnswers);
    console.log('Completed Categories:', Array.from(completedCategories));

    if (totalCorrectAnswers >= 100 && !user.badges.some(badge => badge.title === '100 Soruyu Doğru Yanıtlayan')) {
        user.badges.push({
            title: '100 Soruyu Doğru Yanıtlayan',
            description: 'Toplamda 100 soruyu doğru yanıtladınız.'
        });
        console.log('Rozet eklendi: 100 Soruyu Doğru Yanıtlayan');
    }

    if (allCategories.every(category => completedCategories.has(category)) && !user.badges.some(badge => badge.title === 'Tüm Kategorilerde Quiz Çözmüş')) {
        user.badges.push({
            title: 'Tüm Kategorilerde Quiz Çözmüş',
            description: 'Tüm kategorilerde en az bir quiz çözdünüz.'
        });
        console.log('Rozet eklendi: Tüm Kategorilerde Quiz Çözmüş');
    }

    await user.save();
};

const POINTS_PER_CORRECT_ANSWER = 10;
const POINTS_PER_LEVEL = 100;

router.post('/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'Kullanıcı kayıt edildi.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        return res.status(401).send('Kullanıcı adı veya şifre hatalı.');
    }

    const token = jwt.sign({ _id: user._id }, 'secretKey', { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`).send({ token });
});

router.get('/kategoriler', verifyToken, (req, res) => {
    res.json({ message: 'Kategoriler sayfasına erişim başarılı.' });
});

router.post('/saveQuizResult', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        console.log('Gelen Quiz Sonucu:', req.body);

        const quizResult = {
            category: req.body.category,
            difficulty: req.body.difficulty,
            score: req.body.score,
            correctAnswers: req.body.correctAnswers,
            wrongAnswers: req.body.wrongAnswers,
            questions: req.body.questions || [],
            date: new Date()
        };

        user.quizResults.push(quizResult);

        // Puan ve seviye hesaplama
        user.points += quizResult.correctAnswers * POINTS_PER_CORRECT_ANSWER;
        user.level = Math.floor(user.points / POINTS_PER_LEVEL) + 1;

        await user.save();
        res.status(200).json({ message: 'Quiz sonucu başarıyla kaydedildi.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/quizResults', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.status(200).json({ quizResults: user.quizResults });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        // Kullanıcı istatistiklerini hesapla
        const totalQuizzes = user.quizResults.length;
        const totalCorrect = user.quizResults.reduce((acc, quiz) => acc + quiz.correctAnswers, 0);
        const totalWrong = user.quizResults.reduce((acc, quiz) => acc + quiz.wrongAnswers, 0);
        const averageScore = (user.quizResults.reduce((acc, quiz) => acc + quiz.score, 0) / totalQuizzes).toFixed(2);

        res.status(200).json({
            ...user._doc,
            totalQuizzes,
            totalCorrect,
            totalWrong,
            averageScore
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/updateProfile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        user.username = req.body.username || user.username;
        if (req.body.password) {
            user.password = req.body.password;
        }
        await user.save();

        res.status(200).json({ message: 'Profil güncellendi.', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'interquiz2024@gmail.com' , 
        pass: '7638interquiz'   
    }
});

router.post('/reset-password-request', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        const token = jwt.sign({ _id: user._id }, 'secretKey', { expiresIn: '1h' });
        const resetLink = `http://localhost:5000/public/sifre-sifirlama.html?token=${token}`;

        // E-posta gönderimi
        const mailOptions = {
            from: 'interquiz2024@gmail.com',
            to: user.email,
            subject: 'Şifre Sıfırlama',
            text: `Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n\n${resetLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'E-posta gönderilemedi.' });
            }
            res.status(200).json({ message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' });
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const decoded = jwt.verify(req.body.token, 'secretKey');
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        user.password = req.body.password;
        await user.save();
        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
