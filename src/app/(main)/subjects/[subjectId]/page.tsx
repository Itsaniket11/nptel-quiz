import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion, ArrowRight } from 'lucide-react';
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
export const getSubjectById = (id: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(s => s.id === id);
};


type SubjectPageProps = {
  params: {
    subjectId: string;
  };
};

export default function SubjectPage({ params }: SubjectPageProps) {
  const subject = getSubjectById(params.subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">{subject.name}</h1>
        <p className="text-muted-foreground mt-2">{subject.description}</p>
      </div>

      {subject.quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subject.quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
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
        <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 border-2 border-dashed rounded-lg px-4">
          <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl md:text-2xl font-headline font-semibold">Quizzes Coming Soon</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            We're busy preparing new quizzes for {subject.name}. Please check back later!
          </p>
          <Button variant="outline" asChild className="mt-6">
            <Link href="/subjects">Back to Subjects</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
