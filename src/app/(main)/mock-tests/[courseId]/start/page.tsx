
import { notFound } from 'next/navigation';
import MockTestStartClient from './MockTestStartClient';
import { getCourseById } from '@/app/(main)/courses/[courseId]/page';
import { Question } from '@/lib/types';

type MockTestStartPageProps = {
  params: {
    courseId: string;
  };
};

export default function MockTestStartPage({ params }: MockTestStartPageProps) {
  const course = getCourseById(params.courseId);

  if (!course) {
    notFound();
  }
  
  const allQuestions: Question[] = course.quizzes.flatMap(quiz => quiz.questions);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <MockTestStartClient course={course} maxQuestions={allQuestions.length} />
    </div>
  );
}
