import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleFileUpload = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const uploadPdf = async () => {
    const formData = new FormData();
    formData.append('file', pdfFile);
    const response = await axios.post('http://localhost:5000/upload', formData);
    setQuestions(response.data.questions);
  };

  const startQuiz = async () => {
    const response = await axios.get('http://localhost:5000/questions');
    setQuiz(response.data);
  };

  const handleAnswerClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quiz.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  return (
    <div>
      <h1>Quiz App</h1>
      {!quiz.length ? (
        <div>
          <input type="file" accept="application/pdf" onChange={handleFileUpload} />
          <button onClick={uploadPdf}>Upload PDF</button>
          <button onClick={startQuiz}>Start Quiz</button>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      ) : showScore ? (
        <h2>Your Score: {score}/{quiz.length}</h2>
      ) : (
        <div>
          <h2>
            Question {currentQuestion + 1}/{quiz.length}
          </h2>
          <p>{quiz[currentQuestion].text}</p>
          {quiz[currentQuestion].options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswerClick(i === quiz[currentQuestion].correctOption)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
