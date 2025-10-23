
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getCourses } from '@/app/(main)/courses/page';
import { Button } from '@/components/ui/button';

export default function MockTestsPage() {
  const courses = getCourses();
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Mock Tests</h1>
        <p className="text-muted-foreground mt-2">Select a course to generate a custom mock test.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const placeholder = PlaceHolderImages.find(p => p.id === course.imageId);
          return (
            <Link href={`/mock-tests/${course.id}/start`} key={course.id} className="group">
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
                  <CardTitle className="font-headline text-xl md:text-2xl">{course.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{course.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
