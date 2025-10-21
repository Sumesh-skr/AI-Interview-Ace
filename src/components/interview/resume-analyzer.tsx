
"use client";

import { useState } from 'react';
import { analyzeResumeAndExtractKeywords, AnalyzeResumeInput, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-and-extract-keywords';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StrengthChart, ChartData } from './strength-chart';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { RadialProgress } from '../ui/radial-progress';
import { useAuth } from '@/hooks/use-auth';

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

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const saveAnalysisToFirestore = async (fileName: string, analysisData: AnalyzeResumeOutput) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "resume-analyses"), {
        userId: user.uid,
        fileName,
        name: analysisData.name,
        overallAtsScore: analysisData.overallAtsScore,
        keywords: analysisData.keywords,
        summary: JSON.stringify(analysisData.summary),
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Analysis Saved",
        description: "The analysis is now available on the Resume History page.",
      });
    } catch (error) {
      console.error("Error saving analysis to Firestore:", error);
      toast({
        title: "Firestore Error",
        description: "Could not save the analysis results.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a resume file to analyze.",
        variant: "destructive",
      });
      return;
    }
     if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to analyze a resume.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        const input: AnalyzeResumeInput = { resumeDataUri };
        
        try {
          const result = await analyzeResumeAndExtractKeywords(input);
          
          if (!result || !result.summary) {
            throw new Error("Invalid analysis result from AI.");
          }

          setAnalysisResult(result);
          await saveAnalysisToFirestore(file.name, result);

        } catch (e) {
          console.error("Analysis error:", e);
          toast({
            title: "Analysis Failed",
            description: "The AI failed to analyze the resume. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
          title: "File Error",
          description: "There was an error reading your file.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Outer analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const chartData: ChartData[] = analysisResult ? Object.entries(analysisResult.summary).map(([key, value]) => ({
    name: formatCategoryName(key),
    value: value.score,
  })) : [];

  return (
    <div className="lg:col-span-3">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-headline text-2xl">AI Resume Analyzer</CardTitle>
        <CardDescription>Upload a resume to extract keywords and visualize strengths.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex gap-2 mb-6">
          <Input id="resume-file" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
          <Button onClick={handleSubmit} disabled={isLoading || !user}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Upload />}
            <span className="ml-2 hidden sm:inline">Analyze</span>
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Analyzing resume...</p>
          </div>
        )}

        {!isLoading && analysisResult && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
              <div>
                <h3 className="font-semibold mb-3">Analysis for: <span className="font-bold text-primary">{analysisResult.name}</span></h3>
                {file && <p className="text-sm text-muted-foreground">Original file: {file.name}</p>}
              </div>

              {analysisResult.overallAtsScore !== undefined && (
                <div className="flex flex-col items-center">
                    <h3 className="font-semibold mb-3 text-lg">Overall ATS Score</h3>
                    <RadialProgress value={analysisResult.overallAtsScore} />
                    <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                        This score estimates how well your resume will be parsed by Applicant Tracking Systems.
                    </p>
                </div>
              )}

            {analysisResult.keywords.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Extracted Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {analysisResult.summary && (
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
                    {Object.entries(analysisResult.summary).map(([key, value]) => (
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
          </div>
        )}
      </CardContent>
    </div>
  );
}
