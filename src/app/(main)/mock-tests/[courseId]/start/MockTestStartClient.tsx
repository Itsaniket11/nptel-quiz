
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, FileQuestion, ArrowRight, ChevronLeft, CalendarWeek } from 'lucide-react';
import Link from 'next/link';
import { Subject as Course } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

type MockTestStartClientProps = {
  course: Course;
};

export default function MockTestStartClient({ course }: MockTestStartClientProps) {
  const router = useRouter();
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  
  const availableWeeks = useMemo(() => {
    return [...new Set(course.quizzes.map(q => q.week))].sort((a,b) => a - b);
  }, [course.quizzes]);

  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(availableWeeks);

  const maxQuestions = useMemo(() => {
    return course.quizzes
      .filter(q => selectedWeeks.includes(q.week))
      .reduce((sum, q) => sum + q.questions.length, 0);
  }, [course.quizzes, selectedWeeks]);

  const [numQuestions, setNumQuestions] = useState(Math.min(20, maxQuestions));

  useMemo(() => {
    setNumQuestions(prev => Math.min(prev, maxQuestions));
  }, [maxQuestions]);


  const handleStartTest = () => {
    const weeksQueryParam = selectedWeeks.join(',');
    router.push(`/mock-tests/${course.id}?timeLimit=${timeLimit * 60}&numQuestions=${numQuestions}&weeks=${weeksQueryParam}`);
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeeks(prev => 
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    );
  };
  
  const handleSelectAllWeeks = () => {
    if (selectedWeeks.length === availableWeeks.length) {
      setSelectedWeeks([]);
    } else {
      setSelectedWeeks(availableWeeks);
    }
  }

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

        {availableWeeks.length > 0 && (
          <div className="grid gap-4">
              <Label className="flex items-center">
                  <CalendarWeek className="w-5 h-5 mr-3 text-muted-foreground" />
                  Select Weeks
              </Label>
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="select-all-weeks"
                  checked={selectedWeeks.length === availableWeeks.length}
                  onCheckedChange={handleSelectAllWeeks}
                />
                <Label htmlFor="select-all-weeks" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select All
                </Label>
              </div>
              <ScrollArea className="h-32 w-full rounded-md border p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {availableWeeks.map(week => (
                    <div key={week} className="flex items-center space-x-2">
                      <Checkbox
                        id={`week-${week}`}
                        checked={selectedWeeks.includes(week)}
                        onCheckedChange={() => handleWeekChange(week)}
                      />
                      <Label htmlFor={`week-${week}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Week {week}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
          </div>
        )}

        <div className="grid gap-4">
          <Label htmlFor="num-questions" className="flex items-center">
            <FileQuestion className="w-5 h-5 mr-3 text-muted-foreground" />
            Number of Questions ({numQuestions})
          </Label>
          <Slider
            id="num-questions"
            value={[numQuestions]}
            onValueChange={(value) => setNumQuestions(value[0])}
            min={Math.min(5, maxQuestions)}
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
        <Button className="w-full" size="lg" onClick={handleStartTest} disabled={maxQuestions < 5 || selectedWeeks.length === 0}>
            {maxQuestions < 5 ? 'Not enough questions' : 'Start Mock Test'}
            {maxQuestions >= 5 && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
