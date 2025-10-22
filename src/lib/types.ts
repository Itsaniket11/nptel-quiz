export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  week: number;
  questions: Question[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  imageId: string;
  quizzes: Quiz[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar: string;
}

export interface AnswerData {
    questionId: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
}
