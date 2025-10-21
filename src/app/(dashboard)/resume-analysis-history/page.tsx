
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/dashboard/page-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, FileText, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StrengthChart, ChartData } from '@/components/interview/strength-chart';
import { AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-and-extract-keywords';
import { RadialProgress } from '@/components/ui/radial-progress';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
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
import { format } from 'date-fns';
import { GradientCard } from '@/components/ui/gradient-card';


type SummaryData = AnalyzeResumeOutput['summary'];

interface AnalysisHistoryItem {
  id: string;
  fileName: string;
  name: string;
  overallAtsScore?: number;
  keywords: string[];
  summary: SummaryData;
  createdAt: any;
}

function formatCategoryName(name: string) {
  switch (name) {
    case 'softwareTech': return 'Software Tech';
    case 'hardwareTech': return 'Hardware Tech';
    case 'softSkills': return 'Soft Skills';
    case 'leadership': return 'Leadership';
    case 'experience': return 'Experience';
    case 'academics': return 'Academics';
    default: return name;
  }
}

export default function ResumeAnalysisHistoryPage() {
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
              setIsLoading(false);
              return;
            }
            setIsLoading(true);
            try {
              const q = query(
                collection(db, "resume-analyses"), 
                where("userId", "==", user.uid)
              );
              const querySnapshot = await getDocs(q);
              const historyData = querySnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                  id: doc.id,
                  fileName: data.fileName,
                  name: data.name,
                  overallAtsScore: data.overallAtsScore,
                  keywords: data.keywords,
                  summary: typeof data.summary === 'string' ? JSON.parse(data.summary) : data.summary,
                  createdAt: data.createdAt
                  } as AnalysisHistoryItem;
              });
              
              // Sort on client side
              historyData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

              setHistory(historyData);
              if (historyData.length > 0) {
                  setSelectedAnalysis(historyData[0]);
              } else {
                  setSelectedAnalysis(null);
              }
            } catch (error) {
              console.error("Error fetching analysis history:", error);
              toast({
                  title: "History Error",
                  description: "Could not fetch analysis history. Please check your network or security rules.",
                  variant: "destructive"
              });
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user, toast]);

    const handleDelete = async () => {
        if (!analysisToDelete) return;
        try {
            await deleteDoc(doc(db, "resume-analyses", analysisToDelete));
            
            const updatedHistory = history.filter(item => item.id !== analysisToDelete);
            setHistory(updatedHistory);
            
            if (selectedAnalysis?.id === analysisToDelete) {
                setSelectedAnalysis(updatedHistory.length > 0 ? updatedHistory[0] : null);
            }

            toast({
                title: "Success",
                description: "Analysis history deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting analysis:", error);
            toast({
                title: "Error",
                description: "Could not delete analysis history.",
                variant: "destructive",
            });
        } finally {
            setAnalysisToDelete(null);
        }
    };

    const chartData: ChartData[] = selectedAnalysis ? Object.entries(selectedAnalysis.summary).map(([key, value]) => ({
        name: formatCategoryName(key),
        value: value.score,
    })) : [];

    return (
        <div>
            <PageHeader title="Resume Analysis History" description="Review past resume analyses." />
            <AlertDialog>
                <div className="grid lg:grid-cols-3 gap-8">
                    <GradientCard className="lg:col-span-1">
                        <Card className="h-full border-none shadow-none bg-transparent">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><History className="mr-2" /> History List</CardTitle>
                                <CardDescription>Select an analysis to view details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <ScrollArea className="h-[60vh]">
                                        {history.length > 0 ? (
                                        <div className="space-y-2">
                                            {history.map((item) => (
                                            <div key={item.id} className={`flex items-center w-full rounded-lg transition-colors group ${selectedAnalysis?.id === item.id ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                                                <button 
                                                    onClick={() => setSelectedAnalysis(item)} 
                                                    className="flex-1 text-left p-3"
                                                >
                                                    <p className="font-semibold flex items-center"><FileText className="w-4 h-4 mr-2 flex-shrink-0" /> {item.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{item.fileName}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                    {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), 'dd/MM/yyyy hh:mm:ss a') : 'Date unknown'}
                                                    </p>
                                                </button>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="mr-2 text-muted-foreground hover:text-destructive"
                                                        onClick={() => setAnalysisToDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                            </div>
                                            ))}
                                        </div>
                                        ) : (
                                        <div className="text-center text-muted-foreground py-16">
                                            <History className="w-12 h-12 mx-auto text-primary/20" />
                                            <p className="mt-4">No history found.</p>
                                            <p className="text-sm">Analyze a resume to see its history here.</p>
                                        </div>
                                        )}
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </GradientCard>

                    <div className="lg:col-span-2">
                    {selectedAnalysis ? (
                            <GradientCard>
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-2xl">Analysis Details</CardTitle>
                                        <CardDescription>
                                            Showing analysis for <span className="font-bold text-primary">{selectedAnalysis.name}</span> from file <span className="italic">{selectedAnalysis.fileName}</span>.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8 animate-in fade-in-50 duration-500">
                                        {selectedAnalysis.overallAtsScore !== undefined && (
                                            <div className="flex flex-col items-center">
                                                <h3 className="font-semibold mb-3 text-lg">Overall ATS Score</h3>
                                                <RadialProgress value={selectedAnalysis.overallAtsScore} />
                                                <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                                                    This score estimates how well the resume would be parsed by Applicant Tracking Systems.
                                                </p>
                                            </div>
                                        )}

                                        {selectedAnalysis.keywords.length > 0 && (
                                            <div>
                                            <h3 className="font-semibold mb-3">Extracted Keywords</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAnalysis.keywords.map((keyword, index) => (
                                                <Badge key={index} variant="secondary" className="text-sm">{keyword}</Badge>
                                                ))}
                                            </div>
                                            </div>
                                        )}
                                        
                                        {selectedAnalysis.summary && (
                                            <div>
                                            <h3 className="font-semibold mb-3">Resume Summary</h3>
                                            <Table>
                                                <TableHeader>
                                                <TableRow>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Related Keywords</TableHead>
                                                </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                {Object.entries(selectedAnalysis.summary).map(([key, value]) => (
                                                    <TableRow key={key}>
                                                    <TableCell className="font-medium">{formatCategoryName(key)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                        {value.keywords.length > 0 ? value.keywords.map((kw, i) => (
                                                            <Badge key={i} variant="outline">{kw}</Badge>
                                                        )) : <span className="text-muted-foreground text-xs">N/A</span>}
                                                        </div>
                                                    </TableCell>
                                                    </TableRow>
                                                ))}
                                                </TableBody>
                                            </Table>
                                            </div>
                                        )}

                                        {chartData.length > 0 && (
                                            <div>
                                            <h3 className="font-semibold mb-3">Strength Analysis</h3>
                                            <div className="h-80">
                                                <StrengthChart data={chartData} />
                                            </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </GradientCard>
                    ) : (
                        !isLoading && (
                            <GradientCard className="flex items-center justify-center h-full">
                                <CardContent className="text-center text-muted-foreground py-16">
                                    <FileText className="w-12 h-12 mx-auto text-primary/20" />
                                    <p className="mt-4">Select an analysis from the history list to view details.</p>
                                </CardContent>
                            </GradientCard>
                        )
                    )}
                    </div>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the resume analysis history and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAnalysisToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
