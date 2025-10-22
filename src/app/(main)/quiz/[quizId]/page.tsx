
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import QuizClient from './QuizClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { Quiz, Subject as Course } from '@/lib/types';
import fs from 'fs';
import path from 'path';

// This function should only be called in server-side components/pages.
export const getCourses = (): Course[] => {
  const dataDirectory = path.join(process.cwd(), 'data');
  try {
    const courseDirs = fs.readdirSync(dataDirectory);
    const courses: Course[] = [];

    for (const courseDir of courseDirs) {
        const coursePath = path.join(dataDirectory, courseDir);
        if (!fs.lstatSync(coursePath).isDirectory()) continue;
        
        const subjectJsonPath = path.join(coursePath, 'subject.json');
        if (fs.existsSync(subjectJsonPath)) {
            const subjectJson = fs.readFileSync(subjectJsonPath, 'utf-8');
            const courseData = JSON.parse(subjectJson) as Omit<Course, 'quizzes' | 'id'>;
            
            const quizzes: Quiz[] = [];
            const quizFiles = fs.readdirSync(coursePath).filter(file => file.endsWith('.json') && file !== 'subject.json');

            for (const quizFile of quizFiles) {
              const quizJson = fs.readFileSync(path.join(coursePath, quizFile), 'utf-8');
              const quizData = JSON.parse(quizJson) as Quiz;
              quizzes.push(quizData);
            }

            quizzes.sort((a, b) => a.week - b.week);

            courses.push({
                id: courseDir.replace(/\s+/g, '-').toLowerCase(),
                ...courseData,
                quizzes: quizzes,
            });
        }
    }
    return courses;
  } catch (error) {
    console.error('Failed to read courses from data directory', error);
    return [];
  }
};

// This function should only be called in server-side components/pages.
export const getQuizById = (quizId: string): { quiz: Quiz | undefined, subject: Course | undefined } => {
    const courses = getCourses();
    for (const course of courses) {
        const quiz = course.quizzes.find(q => q.id === quizId);
        if (quiz) {
            return { quiz, subject: course };
        }
    }
    return { quiz: undefined, subject: undefined };
};


type QuizPageProps = {
  params: {
    quizId: string;
  };
   searchParams: { [key: string]: string | string[] | undefined };
};

function QuizSkeleton() {
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
            <div className="mt-8 flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}

export default function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quiz, subject: course } = getQuizById(params.quizId);
  
  if (!quiz || !course) {
      notFound();
  }

  const timeLimit = parseInt(searchParams?.timeLimit as string || '600', 10);

  return (
    <div className="container py-8">
      <Suspense fallback={<QuizSkeleton />}>
        <QuizClient quiz={quiz} subject={course} timeLimitInSeconds={timeLimit} />
      </Suspense>
    </div>
  );
}
