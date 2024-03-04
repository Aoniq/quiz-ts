import quizData from '../quizData.json';

interface Question {
  type: string;
  time: number;
  question: string;
  answers: string[];
  correctAnswer?: number;
}

interface QuizData {
  intro: {
    title: string;
    text: string;
  };
  questions: Question[];
}

export function getQuizData(): QuizData {
  return quizData;
}
