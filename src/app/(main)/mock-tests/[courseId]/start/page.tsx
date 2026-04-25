
import { notFound } from 'next/navigation';
import MockTestStartClient from './MockTestStartClient';
import { getCourseById } from '@/app/(main)/courses/[courseId]/page';

type MockTestStartPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function MockTestStartPage({ params }: MockTestStartPageProps) {
  const resolvedParams = await params;
  const course = getCourseById(resolvedParams.courseId);

  if (!course) {
    notFound();
  }
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <MockTestStartClient course={course} />
    </div>
  );
}
