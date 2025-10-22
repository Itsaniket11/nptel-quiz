'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type FeedbackEntry = {
  subject: string;
  message: string;
  date: Date;
};

export default function FeedbackPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeedback: FeedbackEntry = {
      subject,
      message,
      date: new Date(),
    };

    setFeedbackList([newFeedback, ...feedbackList]);
    
    toast({
      title: 'Feedback Sent!',
      description: "Thanks for your input. We've received your message.",
    });

    // Reset form fields
    setSubject('');
    setMessage('');
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-headline font-bold">Submit Feedback</h1>
            <p className="text-muted-foreground mt-2">Have a suggestion or found an issue? Let us know!</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>Your input helps us improve NPTEL Quizzly for everyone.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Question correction in CS Week 1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide as much detail as possible..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={!subject || !message}>
                Send Feedback <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {feedbackList.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-headline font-bold text-center mb-6">Recent Feedback</h2>
            <div className="space-y-4">
              {feedbackList.map((feedback, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      {feedback.subject}
                    </CardTitle>
                    <CardDescription>
                      Submitted {formatDistanceToNow(feedback.date, { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground break-words">{feedback.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
