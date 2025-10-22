'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, Subject as Course, Question, AnswerData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Timer, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuizClientProps = {
  quiz: Quiz;
  subject: Course;
  timeLimitInSeconds: number;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array) return [];
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function QuizClient({ quiz, subject: course, timeLimitInSeconds }: QuizClientProps) {
  const router = useRouter();
  
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitInSeconds);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  
  useEffect(() => {
    setShuffledQuestions(shuffleArray(quiz.questions));
    setQuestionStartTime(Date.now());
  }, [quiz.questions]);

  useEffect(() => {
    if (quizFinished || questionStartTime === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizFinished, questionStartTime]);

  const currentQuestion = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);


  const finishQuiz = useCallback(() => {
    if (quizFinished) return;
    setQuizFinished(true);

    const finalAnswers = [...answers];
    if (selectedAnswer && currentQuestion) {
        const timeSpent = (Date.now() - questionStartTime) / 1000;
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        finalAnswers.push({
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            selectedAnswer: selectedAnswer,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: isCorrect,
            timeSpent: timeSpent
        });
    }
    
    const quizResult = {
      quizId: quiz.id,
      answers: finalAnswers,
      time: timeLimitInSeconds - timeLeft,
      total: quiz.questions.length,
      score: finalAnswers.filter(a => a.isCorrect).length,
      quiz: quiz,
      subject: course,
    };

    try {
        localStorage.setItem(`quizResult-${quiz.id}`, JSON.stringify(quizResult));
    } catch (e) {
        console.error("Could not save to local storage", e);
    }

    router.replace(`/quiz/${quiz.id}/results`);
  }, [quizFinished, timeLimitInSeconds, timeLeft, router, quiz, course, answers, selectedAnswer, currentQuestion, questionStartTime]);


  const handleNext = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnswers(prev => ([...prev, {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        selectedAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        timeSpent: timeSpent
    }]));

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };
  
  useEffect(() => {
    try {
        localStorage.removeItem(`quizResult-${quiz.id}`);
    } catch (e) {
        console.error("Could not remove item from local storage", e);
    }
  }, [quiz.id]);

  if (shuffledQuestions.length === 0 || !currentQuestion) {
    return <div>Loading quiz...</div>;
  }

  const progress = (currentQuestionIndex / shuffledQuestions.length) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-4">
            <div>
              <p className="text-sm font-medium text-primary">{course.name}</p>
              <CardTitle className="text-2xl md:text-3xl font-headline mt-1">{quiz.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold tabular-nums bg-muted px-3 py-1.5 rounded-md self-start sm:self-center">
                <Timer className="w-5 h-5" />
                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {shuffledQuestions.length}</p>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl md:text-2xl font-semibold mb-6">{currentQuestion.text}</h2>
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            className="space-y-3"
          >
            {shuffledOptions.map((option) => (
              <Label
                key={option}
                className={cn(
                  "flex items-center p-4 border rounded-lg cursor-pointer transition-colors text-base",
                  "hover:bg-accent",
                )}
              >
                <RadioGroupItem value={option} id={option} className="mr-4" />
                <span className="flex-1">{option}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={handleNext} disabled={!selectedAnswer}>
              {currentQuestionIndex < shuffledQuestions.length - 1 ? 'Next Question': 'Finish Quiz'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
