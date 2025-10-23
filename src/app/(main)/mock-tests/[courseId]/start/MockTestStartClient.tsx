
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, FileQuestion, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Subject as Course } from '@/lib/types';
import { Slider } from '@/components/ui/slider';

type MockTestStartClientProps = {
  course: Course;
  maxQuestions: number;
};

export default function MockTestStartClient({ course, maxQuestions }: MockTestStartClientProps) {
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [numQuestions, setNumQuestions] = useState(Math.min(20, maxQuestions));

  const handleStartTest = () => {
    router.push(`/mock-tests/${course.id}?timeLimit=${timeLimit * 60}&numQuestions=${numQuestions}`);
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className='mb-2'>
          <Link href={`/mock-tests`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Mock Tests
          </Link>
        </div>
        <CardTitle className="text-3xl font-headline">{course.name}: Mock Test</CardTitle>
        <CardDescription>Configure your custom practice test.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4">
          <Label htmlFor="num-questions" className="flex items-center">
            <FileQuestion className="w-5 h-5 mr-3 text-muted-foreground" />
            Number of Questions ({numQuestions})
          </Label>
          <Slider
            id="num-questions"
            value={[numQuestions]}
            onValueChange={(value) => setNumQuestions(value[0])}
            min={5}
            max={maxQuestions}
            step={1}
            disabled={maxQuestions < 5}
          />
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
        <Button className="w-full" size="lg" onClick={handleStartTest} disabled={maxQuestions < 5}>
            {maxQuestions < 5 ? 'Not enough questions' : 'Start Mock Test'}
            {maxQuestions >= 5 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
