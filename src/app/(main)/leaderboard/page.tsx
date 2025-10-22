import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Users, Rocket } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/types';

export default function LeaderboardPage() {
    const leaderboardData: LeaderboardEntry[] = []; // Data will be fetched from a database

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">See how you stack up against other learners.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Rankings are updated weekly based on overall quiz scores.</CardDescription>
        </CardHeader>
        <CardContent>
            {leaderboardData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank} className={entry.rank <= 3 ? 'font-bold' : ''}>
                  <TableCell>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                        {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {entry.rank === 2 && <Trophy className="w-5 h-5 text-gray-400" />}
                        {entry.rank === 3 && <Trophy className="w-5 h-5 text-yellow-700" />}
                        {entry.rank > 3 && entry.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback style={{ backgroundColor: `hsl(${entry.score % 360}, 40%, 50%)`}}>
                            {entry.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span>{entry.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{entry.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 border-2 border-dashed rounded-lg px-4">
                    <Rocket className="w-16 h-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl md:text-2xl font-headline font-semibold">Feature Coming Soon!</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        The leaderboard is under construction. We're working hard to bring it to you as soon as possible.
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
