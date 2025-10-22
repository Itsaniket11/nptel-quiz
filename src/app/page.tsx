import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
       <header className="p-4 flex justify-between items-center md:hidden">
        <Link href="/subjects" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-xl font-headline font-bold">NPTEL Quizzly</span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-3xl">
          <GraduationCap className="w-16 h-16 md:w-20 md:h-20 mx-auto text-primary" />
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-bold mt-6">
            NPTEL Quizzly
          </h1>
          <p className="mt-4 text-md sm:text-lg md:text-xl text-muted-foreground">
            Master your NPTEL subjects with interactive quizzes, track your progress, and climb the leaderboard.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/subjects">
                Explore Quizzes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NPTEL Quizzly. All rights reserved.
      </footer>
    </div>
  );
}
