
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import QuizClient from './QuizClient';
import { Skeleton } from '@/components/ui/skeleton';
import type { Quiz, Subject } from '@/lib/types';
import fs from 'fs';
import path from 'path';

// This function should only be called in server-side components/pages.
export const getSubjects = (): Subject[] => {
  const dataDirectory = path.join(process.cwd(), 'data');
  try {
    const subjectDirs = fs.readdirSync(dataDirectory);
    const subjects: Subject[] = [];

    for (const subjectDir of subjectDirs) {
        const subjectPath = path.join(dataDirectory, subjectDir);
        if (!fs.lstatSync(subjectPath).isDirectory()) continue;
        
        const subjectJsonPath = path.join(subjectPath, 'subject.json');
        if (fs.existsSync(subjectJsonPath)) {
            const subjectJson = fs.readFileSync(subjectJsonPath, 'utf-8');
            const subjectData = JSON.parse(subjectJson) as Omit<Subject, 'quizzes' | 'id'>;
            
            const quizzes: Quiz[] = [];
            const quizFiles = fs.readdirSync(subjectPath).filter(file => file.endsWith('.json') && file !== 'subject.json');

            for (const quizFile of quizFiles) {
              const quizJson = fs.readFileSync(path.join(subjectPath, quizFile), 'utf-8');
              const quizData = JSON.parse(quizJson) as Quiz;
              quizzes.push(quizData);
            }

            quizzes.sort((a, b) => a.week - b.week);

            subjects.push({
                id: subjectDir.replace(/\s+/g, '-').toLowerCase(),
                ...subjectData,
                quizzes: quizzes,
            });
        }
    }
    return subjects;
  } catch (error) {
    console.error('Failed to read subjects from data directory', error);
    return [];
  }
};

// This function should only be called in server-side components/pages.
export const getQuizById = (quizId: string): { quiz: Quiz | undefined, subject: Subject | undefined } => {
    const subjects = getSubjects();
    for (const subject of subjects) {
        const quiz = subject.quizzes.find(q => q.id === quizId);
        if (quiz) {
            return { quiz, subject };
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
  const { quiz, subject } = getQuizById(params.quizId);
  
  if (!quiz || !subject) {
      notFound();
  }

  const timeLimit = parseInt(searchParams?.timeLimit as string || '600', 10);

  return (
    <div className="container py-8">
      <Suspense fallback={<QuizSkeleton />}>
        <QuizClient quiz={quiz} subject={subject} timeLimitInSeconds={timeLimit} />
      </Suspense>
    </div>
  );
}
