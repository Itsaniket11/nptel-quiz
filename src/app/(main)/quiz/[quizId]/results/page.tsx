'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, Star, RotateCw, Check, X, TimerIcon, HelpCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnswerData, Question, Quiz, Subject as Course } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

type QuizResult = {
    quizId: string;
    score: number;
    total: number;
    time: number;
    answers: AnswerData[];
    quiz: Quiz;
    subject: Course;
}

function ResultsDisplay() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  
  useEffect(() => {
    try {
        const storedResult = localStorage.getItem(`quizResult-${quizId}`);
        if (storedResult) {
            setResult(JSON.parse(storedResult));
        }
    } catch (e) {
        console.error("Could not load from local storage", e);
    }
  }, [quizId]);


  if (!result) {
    return (
        <div className="container py-4 md:py-8 max-w-4xl mx-auto text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Loading Results...</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please wait while we fetch your results.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const { score, total, time, answers, quiz, subject: course } = result;

  if (!quiz || !course) {
      return (
        <div className="container py-4 md:py-8 max-w-4xl mx-auto text-center">
            <Card>
                <CardHeader>
                    <CardTitle>Error Loading Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>There was an error loading the quiz data for your results.</p>
                    <Button onClick={() => router.push(`/courses`)} className="mt-4">
                        Back to Courses
                    </Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  const percentage = Math.round((score / total) * 100);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const getQuestionById = (questionId: string): Question | undefined => {
    // Search in all quizzes for the course, not just the one in the result
    for (const q of course.quizzes) {
        const question = q.questions.find(ques => ques.id === questionId);
        if (question) return question;
    }
    return undefined;
  }

  return (
    <div className="container py-4 md:py-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">Quiz Results: {quiz.title}</CardTitle>
          <CardDescription>Here's how you performed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <Card>
              <CardHeader className="p-4"><CardTitle className="flex items-center justify-center gap-2 text-sm md:text-base"><Star className="w-4 h-4" /> Score</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0"><p className="text-3xl md:text-4xl font-bold">{percentage}%</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4"><CardTitle className="flex items-center justify-center gap-2 text-sm md:text-base"><CheckCircle className="w-4 h-4" /> Correct</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0"><p className="text-3xl md:text-4xl font-bold">{score} / {total}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4"><CardTitle className="flex items-center justify-center gap-2 text-sm md:text-base"><Clock className="w-4 h-4" /> Time</CardTitle></CardHeader>
              <CardContent className="p-4 pt-0"><p className="text-3xl md:text-4xl font-bold tabular-nums">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p></CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle>Detailed Answer Review</CardTitle>
                <CardDescription>Review each question, your answer, and the correct answer.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {answers.map((ans, i) => {
                        const question = getQuestionById(ans.questionId);
                        if (!question) return null;

                        return (
                            <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger>
                                    <div className="flex items-center justify-between w-full pr-2 md:pr-4 gap-2 text-left">
                                        <div className="flex items-start md:items-center gap-3">
                                            {ans.isCorrect ? <Check className="w-5 h-5 text-green-500 shrink-0 mt-1 md:mt-0" /> : <X className="w-5 h-5 text-destructive shrink-0 mt-1 md:mt-0" />}
                                            <span className="font-medium flex-1">{ans.questionText}</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/50 rounded-b-lg">
                                    <ul className="space-y-2">
                                        {question.options.map(option => {
                                            const isCorrectAnswer = option === ans.correctAnswer;
                                            const isSelectedAnswer = option === ans.selectedAnswer;

                                            return (
                                                <li 
                                                    key={option} 
                                                    className={cn(
                                                        "p-3 border rounded-md flex items-center gap-3 text-sm",
                                                        isCorrectAnswer ? "bg-green-500/10 border-green-500/50" : "",
                                                        !isCorrectAnswer && isSelectedAnswer ? "bg-red-500/10 border-red-500/50" : ""
                                                    )}
                                                >
                                                    {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                                                    {!isCorrectAnswer && isSelectedAnswer && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                                                    {!isCorrectAnswer && !isSelectedAnswer && <HelpCircle className="w-5 h-5 text-muted-foreground/50 shrink-0" />}
                                                    
                                                    <span className="flex-1">{option}</span>
                                                    
                                                    {isSelectedAnswer && !isCorrectAnswer && <span className="text-xs font-semibold text-destructive shrink-0">(Your Answer)</span>}
                                                    {isCorrectAnswer && !isSelectedAnswer && <span className="text-xs font-semibold text-green-600 shrink-0">(Correct)</span>}
                                                    {isCorrectAnswer && isSelectedAnswer && <span className="text-xs font-semibold text-green-600 shrink-0">(Correct)</span>}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button size="lg" onClick={() => router.push(`/courses/${course.id}`)}>
              <RotateCw className="mr-2 h-4 w-4" />
              Try Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div>Loading results...</div>}>
            <ResultsDisplay />
        </Suspense>
    )
}
