
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Clock, Link2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';

export function MeetingScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('10:00');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSchedule = async () => {
    if (!date || !email || !title || !meetingLink || !user?.uid) {
        toast({
            title: "Missing information",
            description: "Please fill out all fields, including the meeting link.",
            variant: "destructive",
        });
        return;
    }
    try {
      await addDoc(collection(db, "meetings"), {
        title,
        date: format(date, "yyyy-MM-dd"),
        time,
        email, // Candidate email
        meetingLink,
        hrId: user.uid, // HR user's ID
        hrEmail: user.email,
      });

      toast({
        title: "Meeting Scheduled!",
        description: `Interview scheduled for ${format(date, "PPP")} at ${time}.`,
      });
      setDate(new Date());
      setTime("10:00");
      setEmail("");
      setTitle("");
      setMeetingLink("");
    } catch(e) {
        console.error("Error adding document: ", e);
        toast({
            title: "Error",
            description: "Could not schedule the meeting. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Meeting Scheduler</CardTitle>
        <CardDescription>Schedule a meeting with a candidate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="candidate-email">Candidate Email</Label>
          <Input id="candidate-email" type="email" placeholder="candidate@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interview-title">Interview Title</Label>
          <Input id="interview-title" type="text" placeholder="e.g. Technical Interview with Google" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="meeting-link">Meeting Link</Label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="meeting-link" type="url" placeholder="https://meet.google.com/..." value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} className="pl-10" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Interview Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-2">
            <Label htmlFor="interview-time">Interview Time</Label>
            <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                id="interview-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-10"
                />
            </div>
            </div>
        </div>
        <Button onClick={handleSchedule} className="w-full" disabled={!user}>
          Schedule Interview
        </Button>
      </CardContent>
    </Card>
  );
}
