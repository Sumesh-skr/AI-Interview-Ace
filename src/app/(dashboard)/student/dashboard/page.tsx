
'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ResumeAnalyzer } from "@/components/interview/resume-analyzer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { GradientCard } from "@/components/ui/gradient-card";

interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
}


export default function StudentDashboardPage() {
    const [scheduledMeetings, setScheduledMeetings] = useState<Meeting[]>([]);
    const { user, userDetails } = useAuth();

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user?.email) return;
            const q = query(collection(db, "meetings"), where("email", "==", user.email));
            const querySnapshot = await getDocs(q);
            const meetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
            setScheduledMeetings(meetings);
        };
        if (user) {
            fetchMeetings();
        }
    }, [user]);

    return (
        <div className="space-y-8">
            <GradientCard>
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Welcome, {userDetails?.fullName || 'Student'}!</CardTitle>
                        <CardDescription>Ready to ace your next interview? Let's get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild size="lg" className="group">
                            <Link href="/student/interview">
                                Start Mock Interview
                                <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </GradientCard>

            <div className="space-y-8">
                <div className="space-y-8">
                   <GradientCard contentClassName="p-6">
                        <ResumeAnalyzer />
                    </GradientCard>
                </div>
                <div>
                    <GradientCard>
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">Scheduled Meetings</CardTitle>
                                <CardDescription>Your upcoming interviews scheduled by HR.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {scheduledMeetings.length > 0 ? (
                                    <ul className="space-y-4">
                                        {scheduledMeetings.map(meeting => (
                                            <li key={meeting.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50">
                                                <div className="flex-shrink-0 bg-primary/10 text-primary rounded-md p-2">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{meeting.title}</p>
                                                    <p className="text-sm text-muted-foreground">{format(parseISO(`${meeting.date}T${meeting.time}`), 'dd/MM/yyyy hh:mm:ss a')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        <p>No meetings scheduled yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </GradientCard>
                </div>
            </div>
        </div>
    );
}
