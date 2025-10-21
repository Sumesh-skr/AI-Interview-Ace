
'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { collection, getDocs, orderBy, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import Link from "next/link";
import { ChevronRight, FileText, Loader2, Trash2, Code, Smartphone, Server, BrainCircuit, Database, Cpu, Router, Briefcase, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";
import { GradientCard } from "@/components/ui/gradient-card";

interface Report {
    id: string;
    interviewType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    report: {
        overallScore: number;
    };
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
}

const iconMap: { [key: string]: LucideIcon } = {
    "Full Stack Interview": Code,
    "Frontend Interview": Smartphone,
    "Backend Interview": Server,
    "AI/ML Interview": BrainCircuit,
    "Data Science Interview": Database,
    "Java Interview": Cpu,
    "Python Interview": Cpu,
    "C++ Interview": Cpu,
    "IoT Interview": Router,
    "HR Interview": Briefcase,
    "default": FileText,
};

const getIconForInterview = (interviewType: string): LucideIcon => {
    return iconMap[interviewType] || iconMap["default"];
}


export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();
    const [reportToDelete, setReportToDelete] = useState<string | null>(null);

    const fetchReports = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const q = query(
                collection(db, "reports"), 
                where("userId", "==", user.uid)
            );
            const querySnapshot = await getDocs(q);
            const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
            
            // Sort on client side
            reportsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

            setReports(reportsData);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [user]);

    const handleDelete = async () => {
        if (!reportToDelete) return;
        try {
            await deleteDoc(doc(db, "reports", reportToDelete));
            setReports(reports.filter(report => report.id !== reportToDelete));
            toast({
                title: "Success",
                description: "Report deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting report:", error);
            toast({
                title: "Error",
                description: "Could not delete report.",
                variant: "destructive",
            });
        } finally {
            setReportToDelete(null);
        }
    };

    const formatDate = (timestamp: Report['createdAt']) => {
        if (!timestamp) return 'Date not available';
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
        return format(date, "dd/MM/yyyy hh:mm:ss a");
    }

    return (
        <div>
            <PageHeader title="My Reports" description="Review your past interview performances." />
            
            <AlertDialog>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="ml-4">Loading reports...</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reports.length > 0 ? (
                            reports.map(report => {
                                const Icon = getIconForInterview(report.interviewType);
                                return (
                                    <GradientCard key={report.id}>
                                        <Card className="hover:shadow-md transition-shadow border-none shadow-none bg-transparent">
                                            <CardHeader className="flex flex-row items-center gap-4">
                                                <div className="flex-shrink-0 p-2">
                                                <Icon className="w-8 h-8 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <CardTitle className="text-xl">{report.interviewType}</CardTitle>
                                                        {report.difficulty && (
                                                            <Badge className="capitalize" variant={report.difficulty === 'hard' ? 'destructive' : report.difficulty === 'medium' ? 'secondary' : 'default'}>
                                                                {report.difficulty}
                                                            </Badge>
                                                        )}
                                                        {report.report?.overallScore !== undefined && (
                                                        <span className="text-sm font-semibold text-muted-foreground">
                                                            Score: {report.report.overallScore}
                                                        </span>
                                                        )}
                                                    </div>
                                                    <CardDescription>
                                                        Completed on {formatDate(report.createdAt)}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button asChild variant="outline" size="icon">
                                                        <Link href={`/student/report/${report.id}`}>
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => setReportToDelete(report.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </GradientCard>
                                );
                            })
                        ) : (
                            <GradientCard>
                                <div className="text-center text-muted-foreground py-16 bg-transparent">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-primary/20" />
                                    <p className="text-lg">No reports found.</p>
                                    <p className="text-sm">Complete an interview to see your report here.</p>
                                </div>
                            </GradientCard>
                        )}
                    </div>
                )}
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the interview report from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReportToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
