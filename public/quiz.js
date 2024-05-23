document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    const questionContainerElement = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const difficultySelection = document.getElementById('difficulty-selection');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const easyButton = document.getElementById('easy');
    const mediumButton = document.getElementById('medium');
    const hardButton = document.getElementById('hard');

    

    document.getElementById('showRegister').addEventListener('click', () => {
        document.getElementById('registerForm').classList.toggle('hide');
        document.getElementById('loginForm').classList.add('hide');
      });
      
      document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('loginForm').classList.toggle('hide');
        document.getElementById('registerForm').classList.add('hide');
      })
  
      
      
    

    let shuffledQuestions, currentQuestionIndex;
    let score = { correct: 0, wrong: 0 };
    let countdown;

    startButton.addEventListener('click', () => {
        startButton.classList.add('hide');
        difficultySelection.classList.remove('hide');
    });

    easyButton.addEventListener('click', () => fetchQuestions('kolay'));
    mediumButton.addEventListener('click', () => fetchQuestions('orta'));
    hardButton.addEventListener('click', () => fetchQuestions('zor'));
    

    startButton.addEventListener('click', showDifficultySelection);
    

    

    function fetchQuestions(difficulty) {
        difficultySelection.classList.add('hide'); // Zorluk seviyesi seçimini gizle
        questionContainerElement.classList.remove('hide'); // Soru konteynerini göster
        // API'den zorluk seviyesine göre soruları getir
        let url = 'http://localhost:5000/questions';
        url += `?difficulty=${difficulty}`;
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sorular alınırken bir hata oluştu: ' + response.statusText);
                }
                return response.json();
            })
            .then(questions => {
                console.log('Gelen sorular:', questions); // Gelen soruları konsola yazdır
                shuffledQuestions = questions;
                currentQuestionIndex = 0;
                setNextQuestion();
            })
            .catch(error => {
                console.error('Sorular yüklenirken bir hata oluştu:', error);
            });
            setTimer(difficulty);    
    }

    function setTimer(difficulty) {
      let timeLimit;
      switch (difficulty) {
        case 'kolay':
          timeLimit = 20;
          break;
        case 'orta':
          timeLimit = 35;
          break;
        case 'zor':
          timeLimit = 45;
          break;
        default:
          timeLimit = 20;
      }
      startCountdown(timeLimit);
    }

    function startCountdown(seconds) {
      clearInterval(countdown); // Mevcut geri sayımı temizle
      let currentTime = seconds;
      timerDisplay.innerText = currentTime;
  
      countdown = setInterval(() => {
        currentTime--;
        timerDisplay.innerText = currentTime;
        if (currentTime <= 0) {
          clearInterval(countdown);
          moveToNextQuestion();
        }
      }, 1000);
    }


    function moveToNextQuestion() {
      currentQuestionIndex++;
      if (currentQuestionIndex < shuffledQuestions.length) {
        setNextQuestion();
      } else {
        endQuiz();
      }
    }

    function endQuiz() {
      clearInterval(countdown);
      showScore();
    }
  
    function showScore() {
      scoreDisplay.innerText = `Doğru: ${score.correct}, Yanlış: ${score.wrong}`;
      scoreDisplay.classList.remove('hide');
    }
    
    function showDifficultySelection() {
        startButton.classList.add('hide');
        difficultySelection.classList.remove('hide');
    }    


    function setNextQuestion() {
      clearInterval(countdown); // Eski zamanlayıcıyı durdur
      resetState(); // UI sıfırlama işlemleri
      showQuestion(shuffledQuestions[currentQuestionIndex]); // Yeni soruyu göster
    
      // Zamanlayıcıyı yeniden başlat
      let timeLimit;
      switch (shuffledQuestions[currentQuestionIndex].difficulty) {
        case 'kolay':
          timeLimit = 20;
          break;
        case 'orta':
          timeLimit = 35;
          break;
        case 'zor':
          timeLimit = 45;
          break;
        default:
          timeLimit = 30; // varsayılan süre
      }
      startTimer(timeLimit);
    }
    
    // Zamanlayıcıyı başlatan fonksiyon
    function startTimer(duration) {
      let time = duration;
      countdown = setInterval(() => {
        if (time <= 0) {
          clearInterval(countdown);
          // Süre dolduğunda otomatik olarak sonraki soruya geç
          if (shuffledQuestions.length > currentQuestionIndex + 1) {
            currentQuestionIndex++;
            setNextQuestion();
          } else {
            showScore();
            startButton.innerText = 'Yeniden Başlat';
            startButton.classList.remove('hide');
          }
        } else {
          // Zamanlayıcıyı güncelle
          timerDisplay.innerText = `${time} saniye kaldı`;
          time--;
        }
      }, 1000);
    }
    
    // Skor gösterme fonksiyonu
    function showScore() {
      questionContainerElement.innerHTML = `<h1>Sonuç: Doğru ${score.correct}, Yanlış ${score.wrong}</h1>`;
    }
        

    function showQuestion(question) {
        questionElement.innerText = question.questionText;
        question.answerOptions.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.answerText;
            button.classList.add('btn', 'btn-primary');
            button.dataset.correct = answer.isCorrect;
            button.addEventListener('click', selectAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetState() {
        clearStatusClass(document.body);
       
    
              while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    function selectAnswer(e) {
  clearInterval(countdown); // Zamanlayıcıyı durdur
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === 'true';
  setStatusClass(document.body, correct);
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct === 'true');
    button.disabled = true; // Butonları devre dışı bırak
  });

  if (correct) {
    score.correct++;
  } else {
    score.wrong++;
  }

  // Skorları göstermek için (bu kodun uygun yere yerleştirilmesi gerekebilir)
  scoreDisplay.innerText = `Doğru: ${score.correct} Yanlış: ${score.wrong}`;

  // Kısa bir gecikme ekleyerek sonraki soruya geç
  setTimeout(() => {
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
      currentQuestionIndex++;
      setNextQuestion();
    } else {
      // Quiz bittiğinde sonuçları göster ve başa dönme seçeneği sun
      startButton.innerText = 'Yeniden Başlat';
      startButton.classList.remove('hide');
      showScore(); // Skoru göster
    }
  }, 1000); // 1 saniye beklet ve sonra geç
}

    

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }
;
  })