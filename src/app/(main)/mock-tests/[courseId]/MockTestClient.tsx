
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, Subject as Course, Question, AnswerData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Timer, Check, Zap, ZapOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

type MockTestClientProps = {
  quiz: Quiz;
  course: Course;
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


const isMultipleChoice = (question: Question) => Array.isArray(question.correctAnswer);

const getCorrectAnswers = (question: Question): string[] => {
    if (Array.isArray(question.correctAnswer)) {
        return question.correctAnswer;
    }
    return [question.correctAnswer];
};

const checkIsCorrect = (question: Question, selected: string | string[] | null): boolean => {
    if (selected === null || (Array.isArray(selected) && selected.length === 0)) return false;
    const correctAnswers = getCorrectAnswers(question);
    
    if (isMultipleChoice(question)) {
        if (!Array.isArray(selected)) return false;
        const sortedSelected = [...selected].sort();
        const sortedCorrect = [...correctAnswers].sort();
        return sortedSelected.length === sortedCorrect.length && sortedSelected.every((ans, i) => ans === sortedCorrect[i]);
    } else {
        return selected === correctAnswers[0];
    }
}


export default function MockTestClient({ quiz, course, timeLimitInSeconds }: MockTestClientProps) {
  const router = useRouter();
  
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | string[] | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitInSeconds);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  
  useEffect(() => {
    const questions = shuffleArray(quiz.questions);
    setShuffledQuestions(questions);
    setAnswers(new Array(questions.length).fill(null));
    setQuizStarted(true);
  }, [quiz.questions]);

  useEffect(() => {
    if (quizFinished || !quizStarted) return;

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
  }, [quizFinished, quizStarted]);

  const currentQuestion = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);
  const selectedAnswer = answers[currentQuestionIndex];
  const isMulti = useMemo(() => currentQuestion ? isMultipleChoice(currentQuestion) : false, [currentQuestion]);

  const shuffledOptions = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);


  const finishQuiz = useCallback(() => {
    if (quizFinished) return;
    setQuizFinished(true);

    const finalAnswers: AnswerData[] = shuffledQuestions.map((question, index) => {
        const selected = answers[index];
        const isCorrect = checkIsCorrect(question, selected);
        return {
            questionId: question.id,
            questionText: question.text,
            selectedAnswer: selected ?? 'Not Answered',
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            timeSpent: 0 // Not tracked in mock tests
        }
    });
    
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
        localStorage.setItem(`mockTestResult-${quiz.id}`, JSON.stringify(quizResult));
    } catch (e) {
        console.error("Could not save to local storage", e);
    }

    router.replace(`/mock-tests/${course.id}/results?quizId=${quiz.id}`);
  }, [quizFinished, timeLimitInSeconds, timeLeft, router, quiz, course, answers, shuffledQuestions]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, shuffledQuestions.length]);

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    if (isMulti) {
        const currentSelection = (newAnswers[currentQuestionIndex] as string[] | null) || [];
        if (currentSelection.includes(answer)) {
            newAnswers[currentQuestionIndex] = currentSelection.filter(a => a !== answer);
        } else {
            newAnswers[currentQuestionIndex] = [...currentSelection, answer];
        }
    } else {
        newAnswers[currentQuestionIndex] = answer;
        if (autoNext) {
            setTimeout(() => {
                handleNext();
            }, 300); // Small delay to show selection
        }
    }
    setAnswers(newAnswers);
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  useEffect(() => {
    try {
        localStorage.removeItem(`mockTestResult-${quiz.id}`);
    } catch (e) {
        console.error("Could not remove item from local storage", e);
    }
  }, [quiz.id]);

  if (shuffledQuestions.length === 0 || !currentQuestion) {
    return <div>Loading quiz...</div>;
  }

  const progress = ((answers.filter(a => a !== null && (!Array.isArray(a) || a.length > 0)).length) / shuffledQuestions.length) * 100;

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
             {!isMulti && (
                <div className="flex items-center space-x-2 pt-2">
                    <Switch id="auto-next-switch" checked={autoNext} onCheckedChange={setAutoNext} />
                    <Label htmlFor="auto-next-switch" className='flex items-center'>
                        {autoNext ? <Zap className="w-4 h-4 mr-2" /> : <ZapOff className="w-4 h-4 mr-2" />}
                        Auto-Next on Answer
                    </Label>
                </div>
             )}
          </div>
        </CardHeader>
        <CardContent>
            <div className='mb-4'>
                <h2 className="text-xl md:text-2xl font-semibold">{currentQuestion.text}</h2>
                {isMulti && <p className="text-sm text-muted-foreground mt-2">Select all that apply.</p>}
            </div>

            {isMulti ? (
                <div className="space-y-3">
                {shuffledOptions.map((option) => {
                    const isChecked = Array.isArray(selectedAnswer) && selectedAnswer.includes(option);
                    return (
                    <Label
                        key={option}
                        className={cn(
                        "flex items-center p-4 border rounded-lg cursor-pointer transition-colors text-base",
                        "hover:bg-accent",
                        isChecked && "bg-primary/10 border-primary"
                        )}
                    >
                        <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleSelectAnswer(option)}
                        id={option}
                        className="mr-4"
                        />
                        <span className="flex-1">{option}</span>
                    </Label>
                    );
                })}
                </div>
            ) : (
                <RadioGroup
                value={(selectedAnswer as string) || ''}
                onValueChange={handleSelectAnswer}
                className="space-y-3"
                >
                {shuffledOptions.map((option) => (
                    <Label
                    key={option}
                    className={cn(
                        "flex items-center p-4 border rounded-lg cursor-pointer transition-colors text-base",
                        "hover:bg-accent",
                        selectedAnswer === option && "bg-primary/10 border-primary"
                    )}
                    >
                    <RadioGroupItem value={option} id={option} className="mr-4" />
                    <span className="flex-1">{option}</span>
                    </Label>
                ))}
                </RadioGroup>
            )}


          <div className="mt-8 flex justify-between">
            <Button size="lg" onClick={handleBack} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                <Button size="lg" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="lg" variant="default" disabled={progress === 0}>
                            Finish Test
                            <Check className="ml-2 h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to finish?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Any unanswered questions will be marked as incorrect. You cannot return to the test once submitted.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={finishQuiz}>Finish Test</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
