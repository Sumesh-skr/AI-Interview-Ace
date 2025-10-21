
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loader2, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { RadialProgress } from "@/components/ui/radial-progress";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { GradientCard } from "@/components/ui/gradient-card";

interface QuestionAnalysis {
    question: string;
    answer: string;
    feedback: string;
    score: number;
}

interface ReportData {
    userId: string;
    interviewType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: { seconds: number, nanoseconds: number };
    report: {
        overallScore: number;
        overallFeedback: string;
        strengths: string[];
        areasForImprovement: string[];
        questionAnalysis: QuestionAnalysis[];
    }
}

export default function ReportPage() {
    const { id } = useParams();
    const router = useRouter();
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReport = async () => {
            if (!id || !user) {
                setIsLoading(false);
                return;
            };

            const reportId = Array.isArray(id) ? id[0] : id;
            const docRef = doc(db, "reports", reportId);

            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as ReportData;
                    if (data.userId !== user.uid) {
                        // If the report does not belong to the current user, redirect them.
                        router.push('/student/reports'); 
                    } else {
                        setReportData(data);
                    }
                } else {
                    console.log("No such document!");
                    router.push('/student/reports');
                }
            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchReport();
        }

    }, [id, user, router]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!reportData) {
        return (
            <PageHeader
                title="Report Not Found"
                description="The report you are looking for does not exist or you do not have permission to view it."
            />
        );
    }
    
    const { report } = reportData;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <PageHeader
                    title="Interview Performance Report"
                    description={`Analysis of your ${reportData.interviewType} on ${format(new Date(reportData.createdAt.seconds * 1000), 'dd/MM/yyyy hh:mm:ss a')}`}
                />
                {reportData.difficulty && (
                    <Badge className="capitalize text-lg" variant={reportData.difficulty === 'hard' ? 'destructive' : reportData.difficulty === 'medium' ? 'secondary' : 'default'}>
                        {reportData.difficulty}
                    </Badge>
                )}
            </div>


            <div className="grid gap-8">
                {/* Overall Score & Feedback */}
                <GradientCard>
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader className="items-center text-center">
                            <CardTitle className="font-headline text-2xl">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6">
                            <RadialProgress value={report.overallScore} />
                            <p className="max-w-2xl text-center text-muted-foreground">
                                {report.overallFeedback}
                            </p>
                        </CardContent>
                    </Card>
                </GradientCard>

                {/* Strengths and Areas for Improvement */}
                <div className="grid md:grid-cols-2 gap-8">
                    <GradientCard>
                        <Card className="border-none shadow-none bg-transparent h-full">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2">
                                    <CheckCircle className="text-green-500" /> Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc space-y-2 pl-5">
                                    {report.strengths.map((strength, index) => (
                                        <li key={index}>{strength}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </GradientCard>
                    <GradientCard>
                        <Card className="border-none shadow-none bg-transparent h-full">
                            <CardHeader>
                                <CardTitle className="font-headline text-xl flex items-center gap-2">
                                    <ShieldAlert className="text-yellow-500" /> Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc space-y-2 pl-5">
                                    {report.areasForImprovement.map((area, index) => (
                                        <li key={index}>{area}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </GradientCard>
                </div>

                {/* Question-by-Question Analysis */}
                <GradientCard>
                    <Card className="border-none shadow-none bg-transparent">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Question-by-Question Analysis</CardTitle>
                            <CardDescription>
                                Detailed feedback on each of your answers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {report.questionAnalysis.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>
                                            <div className="flex w-full items-center justify-between pr-4">
                                                <span className="flex-1 text-left">Question #{index + 1}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${item.score >= 70 ? 'text-green-500' : item.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {item.score}/100
                                                    </span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <div className="rounded-md bg-secondary/50 p-3">
                                                <p className="font-semibold">Question:</p>
                                                <p>{item.question}</p>
                                            </div>
                                            <div className="rounded-md bg-secondary/50 p-3">
                                                <p className="font-semibold">Your Answer:</p>
                                                <p className="text-muted-foreground">{item.answer}</p>
                                            </div>
                                            <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                                                <p className="font-semibold">Feedback:</p>
                                                <p>{item.feedback}</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </GradientCard>
            </div>
        </div>
    );
}
