import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import QuizStartClient from './QuizStartClient';
import fs from 'fs';
import path from 'path';
import { Subject, Quiz } from '@/lib/types';


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

type QuizStartPageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizStartPage({ params }: QuizStartPageProps) {
  const { quiz, subject } = getQuizById(params.quizId);

  if (!quiz || !subject) {
    notFound();
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <QuizStartClient quiz={quiz} subject={subject} />
    </div>
  );
}
