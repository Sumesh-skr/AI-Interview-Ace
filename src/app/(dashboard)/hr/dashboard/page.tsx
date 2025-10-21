
'use client'
import { ResumeAnalyzer } from "@/components/interview/resume-analyzer";
import { MeetingScheduler } from "@/components/interview/meeting-scheduler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { GradientCard } from "@/components/ui/gradient-card";

interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    email: string;
    meetingLink?: string;
}

export default function HrDashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { user, userDetails } = useAuth();
  
  useEffect(() => {
      const fetchMeetings = async () => {
        if (!user?.uid) return;

        const q = query(
          collection(db, "meetings"), 
          where("hrId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const allMeetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
        
        const now = new Date();
        const upcomingMeetings = allMeetings.filter(meeting => {
            const meetingDateTime = parseISO(`${meeting.date}T${meeting.time}`);
            return meetingDateTime >= now;
        });

        // Sort upcoming meetings: soonest date and time first.
        upcomingMeetings.sort((a, b) => {
            const aDateTime = parseISO(`${a.date}T${a.time}`).getTime();
            const bDateTime = parseISO(`${b.date}T${b.time}`).getTime();
            return aDateTime - bDateTime;
        });
        
        setMeetings(upcomingMeetings);
      };
      fetchMeetings();
  }, [user]);

  return (
    <div className="space-y-8">
        <GradientCard>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Welcome, {userDetails?.fullName || 'HR'}!</CardTitle>
                    <CardDescription>Analyze resumes and schedule interviews with candidates.</CardDescription>
                </CardHeader>
            </Card>
        </GradientCard>

      <div className="space-y-8">
        <GradientCard>
            <MeetingScheduler />
        </GradientCard>
        <GradientCard>
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>All interviews scheduled with candidates.</CardDescription>
            </CardHeader>
            <CardContent>
                {meetings.length > 0 ? (
                    <ul className="space-y-4">
                        {meetings.map(meeting => (
                            <li key={meeting.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
                                <div className="flex-shrink-0 bg-primary/10 text-primary rounded-md p-2">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{meeting.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                    {format(parseISO(`${meeting.date}T${meeting.time}`), 'dd/MM/yyyy hh:mm:ss a')} with {meeting.email}
                                    </p>
                                    {meeting.meetingLink && (
                                        <Button asChild variant="link" className="p-0 h-auto">
                                            <Link href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                                Join Meeting
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No upcoming meetings scheduled.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </GradientCard>
      </div>

      <div className="space-y-8">
        <GradientCard>
            <ResumeAnalyzer />
        </GradientCard>
      </div>
    </div>
  );
}
