
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, History, Loader2, Video } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from 'date-fns';
import { GradientCard } from "@/components/ui/gradient-card";

interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    email: string;
    meetingLink?: string;
}

export default function MeetingsPage() {
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [previousMeetings, setPreviousMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMeetings = async () => {
            if (!user?.email) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const q = query(collection(db, "meetings"), where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                const allMeetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
                
                const now = new Date();

                const upcoming: Meeting[] = [];
                const previous: Meeting[] = [];

                allMeetings.forEach(meeting => {
                    const meetingDateTime = parseISO(`${meeting.date}T${meeting.time}`);
                    if (meetingDateTime >= now) {
                        upcoming.push(meeting);
                    } else {
                        previous.push(meeting);
                    }
                });

                upcoming.sort((a,b) => parseISO(`${a.date}T${a.time}`).getTime() - parseISO(`${b.date}T${b.time}`).getTime());
                previous.sort((a,b) => parseISO(`${b.date}T${b.time}`).getTime() - parseISO(`${a.date}T${a.time}`).getTime());

                setUpcomingMeetings(upcoming); 
                setPreviousMeetings(previous);

            } catch (error) {
                console.error("Error fetching meetings: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeetings();
    }, [user]);

    const MeetingCard = ({ meeting, isPrevious }: { meeting: Meeting, isPrevious?: boolean }) => (
        <GradientCard>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary rounded-md p-3">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>Scheduled for {format(parseISO(`${meeting.date}T${meeting.time}`), 'dd/MM/yyyy hh:mm:ss a')}</CardDescription>
                    </div>
                    {!isPrevious && meeting.meetingLink && (
                        <Button asChild>
                            <Link href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2" /> Join Meeting
                            </Link>
                        </Button>
                    )}
                </CardHeader>
            </Card>
        </GradientCard>
    );

    return (
        <div>
            <PageHeader title="My Meetings" description="Manage your upcoming and past interviews." />
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4">Loading meetings...</p>
                </div>
            ) : (
                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                            <Calendar className="mr-3 text-primary" />
                            Upcoming Meetings
                        </h2>
                        {upcomingMeetings.length > 0 ? (
                            <div className="grid gap-6">
                                {upcomingMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} isPrevious={false} />)}
                            </div>
                        ) : (
                             <GradientCard>
                                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                                    <p className="text-lg">No upcoming meetings scheduled.</p>
                                    <p className="text-sm">Check back later for updates.</p>
                                </div>
                            </GradientCard>
                        )}
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                            <History className="mr-3 text-primary" />
                            Previous Meetings
                        </h2>
                        {previousMeetings.length > 0 ? (
                            <div className="grid gap-6">
                                {previousMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} isPrevious={true} />)}
                            </div>
                        ) : (
                            <GradientCard>
                                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                                    <p className="text-lg">No previous meetings found.</p>
                                </div>
                            </GradientCard>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
