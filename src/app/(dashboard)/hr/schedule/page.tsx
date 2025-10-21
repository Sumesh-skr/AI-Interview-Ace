
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, History, Loader2, Video, List, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MeetingScheduler } from "@/components/interview/meeting-scheduler";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { GradientCard } from "@/components/ui/gradient-card";


interface Meeting {
    id: string;
    title: string;
    date: string;
    time: string;
    email: string;
    meetingLink?: string;
}

export default function SchedulePage() {
    const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [previousMeetings, setPreviousMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const now = new Date();
    const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
    const { toast } = useToast();


    const fetchMeetings = async () => {
        if (!user?.uid) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const q = query(collection(db, "meetings"), where("hrId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const fetchedMeetings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
            
            fetchedMeetings.sort((a,b) => parseISO(`${b.date}T${b.time}`).getTime() - parseISO(`${a.date}T${a.time}`).getTime());
            setAllMeetings(fetchedMeetings);

            const upcoming: Meeting[] = [];
            const previous: Meeting[] = [];

            fetchedMeetings.forEach(meeting => {
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

    useEffect(() => {
        fetchMeetings();
    }, [user]);

    const handleDeleteMeeting = async () => {
        if (!meetingToDelete) return;
        try {
            await deleteDoc(doc(db, "meetings", meetingToDelete));
            await fetchMeetings(); // Refetch all meetings to update all lists
            toast({
                title: "Success",
                description: "Meeting deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting meeting:", error);
            toast({
                title: "Error",
                description: "Could not delete meeting.",
                variant: "destructive",
            });
        } finally {
            setMeetingToDelete(null);
        }
    };


    const MeetingCard = ({ meeting, isPrevious, showDelete }: { meeting: Meeting; isPrevious?: boolean; showDelete?: boolean }) => (
        <GradientCard>
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex-shrink-0 bg-primary/10 text-primary rounded-md p-3">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle>{meeting.title}</CardTitle>
                        <CardDescription>Scheduled for {format(parseISO(`${meeting.date}T${meeting.time}`), 'dd/MM/yyyy hh:mm:ss a')} with {meeting.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isPrevious && meeting.meetingLink && (
                            <Button asChild>
                                <Link href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <Video className="mr-2" /> Join Meeting
                                </Link>
                            </Button>
                        )}
                        {showDelete && (
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => setMeetingToDelete(meeting.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                        )}
                    </div>
                </CardHeader>
            </Card>
        </GradientCard>
    );
    
    return (
        <div>
            <PageHeader title="Schedule Interviews" description="Schedule and manage candidate interviews." />

            <AlertDialog>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <GradientCard>
                            <MeetingScheduler />
                        </GradientCard>
                    </div>
                    <div className="lg:col-span-2 space-y-12">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                            <section>
                                <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                                    <Calendar className="mr-3 text-primary" />
                                    Upcoming Meetings
                                </h2>
                                {upcomingMeetings.length > 0 ? (
                                    <div className="grid gap-6">
                                        {upcomingMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} isPrevious={false} showDelete={false} />)}
                                    </div>
                                ) : (
                                    <GradientCard>
                                        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                                            <p className="text-lg">No upcoming meetings scheduled.</p>
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
                                        {previousMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} isPrevious={true} showDelete={false} />)}
                                    </div>
                                ) : (
                                    <GradientCard>
                                        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                                            <p className="text-lg">No previous meetings found.</p>
                                        </div>
                                    </GradientCard>
                                )}
                            </section>

                            <section>
                                <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                                    <List className="mr-3 text-primary" />
                                    All Meetings
                                </h2>
                                {allMeetings.length > 0 ? (
                                    <div className="grid gap-6">
                                        {allMeetings.map(meeting => {
                                            const meetingDateTime = parseISO(`${meeting.date}T${meeting.time}`);
                                            return <MeetingCard key={meeting.id} meeting={meeting} isPrevious={meetingDateTime < now} showDelete={true} />;
                                        })}
                                    </div>
                                ) : (
                                    <GradientCard>
                                        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                                            <p className="text-lg">No meetings found.</p>
                                        </div>
                                    </GradientCard>
                                )}
                            </section>
                            </>
                        )}
                    </div>
                </div>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the meeting record from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMeetingToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMeeting}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
