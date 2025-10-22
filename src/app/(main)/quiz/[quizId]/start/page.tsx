import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import QuizStartClient from './QuizStartClient';
import fs from 'fs';
import path from 'path';
import { Subject as Course, Quiz } from '@/lib/types';


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

type QuizStartPageProps = {
  params: {
    quizId: string;
  };
};

export default function QuizStartPage({ params }: QuizStartPageProps) {
  const { quiz, subject: course } = getQuizById(params.quizId);

  if (!quiz || !course) {
    notFound();
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <QuizStartClient quiz={quiz} subject={course} />
    </div>
  );
}
