
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MockTestClient from './MockTestClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { Question, Subject as Course } from '@/lib/types';
import { getCourseById } from '@/app/(main)/courses/[courseId]/page';

type MockTestPageProps = {
  params: {
    courseId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

function MockTestSkeleton() {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-10 w-3/4" />
            </div>
            <div className="mt-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="mt-8 flex justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function MockTestPage({ params, searchParams }: MockTestPageProps) {
  const course = getCourseById(params.courseId);
  
  if (!course) {
      notFound();
  }

  const timeLimit = parseInt(searchParams?.timeLimit as string || '1800', 10);
  const numQuestions = parseInt(searchParams?.numQuestions as string || '20', 10);
  const weeksParam = searchParams?.weeks as string || '';
  const selectedWeeks = weeksParam ? weeksParam.split(',').map(Number) : [];

  const allQuestions: Question[] = course.quizzes
    .filter(quiz => selectedWeeks.length === 0 || selectedWeeks.includes(quiz.week))
    .flatMap(quiz => quiz.questions);

  const shuffledAllQuestions = shuffleArray(allQuestions);
  const selectedQuestions = shuffledAllQuestions.slice(0, numQuestions);

  const mockQuiz = {
    id: `mock-${course.id}-${new Date().getTime()}`,
    title: `${course.name} Mock Test`,
    week: 0,
    questions: selectedQuestions
  }

  return (
    <div className="container py-8">
      <Suspense fallback={<MockTestSkeleton />}>
        <MockTestClient quiz={mockQuiz} course={course} timeLimitInSeconds={timeLimit} />
      </Suspense>
    </div>
  );
}
