'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, FileQuestion, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { Quiz, Subject as Course } from '@/lib/types';

type QuizStartClientProps = {
  quiz: Quiz;
  subject: Course;
};

export default function QuizStartClient({ quiz, subject: course }: QuizStartClientProps) {
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState(10); // Default 10 minutes

  const handleStartQuiz = () => {
    router.push(`/quiz/${quiz.id}?timeLimit=${timeLimit * 60}`);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className='mb-2'>
          <Link href={`/courses/${course.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to {course.name}
          </Link>
        </div>
        <CardTitle className="text-3xl font-headline">{quiz.title}</CardTitle>
        <CardDescription>Prepare yourself for the upcoming challenge.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center text-muted-foreground">
          <FileQuestion className="w-5 h-5 mr-3" />
          <span>{quiz.questions.length} multiple-choice questions</span>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time-limit" className="flex items-center">
            <Timer className="w-5 h-5 mr-3 text-muted-foreground" />
            Set Time Limit (in minutes)
          </Label>
          <Input
            id="time-limit"
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={handleStartQuiz}>
          Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
