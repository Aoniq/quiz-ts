'use client';
import React, { useState, useEffect } from 'react';
import { getQuizData } from '@/utils/quizService';

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getQuizData();
      setQuizData(data);
      if (data && data.questions && data.questions[currentQuestionIndex]) {
        setTimeRemaining(data.questions[currentQuestionIndex].time);
      }
    };
    fetchData();
  }, [currentQuestionIndex]);

  const handleMultipleChoiceChange = (question, option) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [question]: option
    }));
  };

  const handleOpenAnswerChange = (event) => {
    const { name, value } = event.target;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [name]: value
    }));
  };

  const handleNext = () => {
    resetTimer();
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let correct = 0;
    let wrong = 0;
    quizData.questions.forEach((question, index) => {
      if (answers[`question_${index}`] !== undefined) {
        if (question.type === 'MULTIPLECHOICE' && parseInt(answers[`question_${index}`]) === question.correctAnswer) {
          correct++;
        } else if (question.type === 'Open' && answers[`question_${index}`].toLowerCase() === question.answers[0].toLowerCase()) {
          correct++;
        } else {
          wrong++;
        }
      } else {
        wrong++;
      }
    });
    setCorrectCount(correct);
    setWrongCount(wrong);
    resetTimer();
    if (currentQuestionIndex === quizData.questions.length - 1) {
      setShowModal(true);
    } else {
      handleNext();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    resetQuiz();
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCorrectCount(0);
    setWrongCount(0);
    if (quizData && quizData.questions.length > 0 && currentQuestionIndex < quizData.questions.length) {
      setTimeRemaining(quizData.questions[currentQuestionIndex].time);
    } else {
      setTimeRemaining(null);
    }
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    setTimerInterval(null);
    if (quizData) {
      setTimeRemaining(quizData.questions[currentQuestionIndex].time ?? null);
    }
  };

  useEffect(() => {
    if (quizData && timerInterval === null && currentQuestionIndex < quizData.questions.length && !showModal) {
      setTimerInterval(setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 100);
      }, 100));
    }
  }, [currentQuestionIndex, timerInterval, quizData, showModal]);

  useEffect(() => {
    if (timeRemaining === 0 && currentQuestionIndex === quizData.questions.length - 1) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      let correct = 0;
      let wrong = 0;
      quizData.questions.forEach((question, index) => {
        if (answers[`question_${index}`] !== undefined) {
          if (question.type === 'MULTIPLECHOICE' && parseInt(answers[`question_${index}`]) === question.correctAnswer) {
            correct++;
          } else if (question.type === 'Open' && answers[`question_${index}`].toLowerCase() === question.answers[0].toLowerCase()) {
            correct++;
          } else {
            wrong++;
          }
        } else {
          wrong++;
        }
      });
      setCorrectCount(correct);
      setWrongCount(wrong);
      setShowModal(true);
    } else if (timeRemaining === 0) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      handleNext();
    }
  }, [timeRemaining]);
  

  if (!quizData) {
    return <div>Loading...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {showModal ? (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-md">
            <h2 className="text-lg font-semibold">Results</h2>
            <p>Correct answers: {correctCount}</p>
            <p>Wrong answers: {wrongCount}</p>
            <button onClick={closeModal} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Close</button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8">{quizData.intro.title}</h1>
          <p>{quizData.intro.text}</p>
          <form onSubmit={handleSubmit} className="flex flex-col items-start">
            {currentQuestion && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>
                {currentQuestion.type === 'MULTIPLECHOICE' ? (
                  <div className="flex flex-col">
                    {currentQuestion.answers.map((answer, i) => (
                      <label key={i}>
                        <input 
                          type="radio" 
                          name={`question_${currentQuestionIndex}`} 
                          value={i} 
                          onChange={() => handleMultipleChoiceChange(`question_${currentQuestionIndex}`, i)} 
                          checked={answers[`question_${currentQuestionIndex}`] === i} 
                        />
                        {answer}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input 
                    type="text" 
                    name={`question_${currentQuestionIndex}`} 
                    onChange={handleOpenAnswerChange} 
                    value={answers[`question_${currentQuestionIndex}`] || ''} 
                    className="border border-gray-300 rounded-md p-2"
                  />
                )}
              </div>
            )}

{currentQuestion && (
    <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <progress className="w-full h-full bg-blue-500 bar" value={quizData.questions[currentQuestionIndex].time - timeRemaining} max={quizData.questions[currentQuestionIndex].time}></progress>
    </div>
)}
    
            {currentQuestionIndex < quizData.questions.length - 1 && (
              <button type="button" onClick={handleNext} className="bg-blue-500 text-white py-2 px-4 rounded-md">Next</button>
            )}
            {currentQuestionIndex === quizData.questions.length - 1 && (
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">Submit</button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
