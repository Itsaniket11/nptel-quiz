import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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


export default function SubjectsPage() {
  const subjects = getSubjects();
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Subjects</h1>
        <p className="text-muted-foreground mt-2">Choose a subject to start your learning journey.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const placeholder = PlaceHolderImages.find(p => p.id === subject.imageId);
          return (
            <Link href={`/subjects/${subject.id}`} key={subject.id} className="group">
              <Card className="h-full flex flex-col transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10">
                <CardHeader>
                  {placeholder && (
                    <div className="overflow-hidden rounded-lg mb-4">
                      <Image
                        src={placeholder.imageUrl}
                        alt={placeholder.description}
                        data-ai-hint={placeholder.imageHint}
                        width={600}
                        height={400}
                        className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardTitle className="font-headline text-xl md:text-2xl">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{subject.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
