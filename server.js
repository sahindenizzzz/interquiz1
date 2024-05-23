const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();
// Middleware kullanımı
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
// MongoDB Atlas Bağlantısı
const dbURI = "mongodb+srv://sahindenizzzz:Emv0EtvfSLHQajYO@sorular.u3svaa7.mongodb.net/Question?retryWrites=true&w=majority&appName=Sorular";
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Atlas Bağlantısı Başarılı'))
  .catch((err) => console.error(err));
// Static Dosyaları Sunma
app.use(express.static(path.join(__dirname, 'public')));
// Route Tanımlamaları
const questionsRouter = require('./routes/questions');
app.use('/questions', questionsRouter);
const authRoutes = require('./routes/users');
app.use('/users', authRoutes);
const forumRoutes = require('./routes/forum');  // Forum route'u ekleyin
app.use('/forum', forumRoutes);  // Forum route'unu kullanın
const feedbackRoutes = require('./routes/feedback');  // Forum route'u ekleyin
app.use('/feedback', feedbackRoutes);  // Forum route'unu kullanın

// Ana Sayfa Route'u
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Sunucuyu Başlatma
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} Portunda Çalışıyor...`));
