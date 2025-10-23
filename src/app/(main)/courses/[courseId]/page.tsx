import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, ArrowRight } from 'lucide-react';
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
export const getCourseById = (id: string): Course | undefined => {
  const courses = getCourses();
  return courses.find(s => s.id === id);
};


type CoursePageProps = {
  params: {
    courseId: string;
  };
};

export default function CoursePage({ params }: CoursePageProps) {
  const course = getCourseById(params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="container py-8 animate-fade-in-down">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">{course.name}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
      </div>

      {course.quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {course.quizzes.map((quiz, index) => (
            <Card key={quiz.id} className="flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
              <CardHeader>
                <CardTitle className="font-headline">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-muted-foreground">
                  <p>{quiz.questions.length} Questions</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/quiz/${quiz.id}/start`}>
                    Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 border-2 border-dashed rounded-lg px-4 animate-fade-in">
          <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl md:text-2xl font-headline font-semibold">Quizzes Coming Soon</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            We're busy preparing new quizzes for {course.name}. Please check back later!
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
