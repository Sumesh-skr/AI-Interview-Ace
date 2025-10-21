
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AiFigure } from "@/components/interview/ai-figure";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, MicOff, RefreshCw, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiInterview, AiInterviewInput, AiInterviewOutput } from '@/ai/flows/ai-figure-interface';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '../ui/sidebar';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '../ui/carousel';

interface InterviewClientPageProps {
    interviewType: 'hr' | 'technical';
    technicalSubsection?: string;
    interviewTitle: string;
    interviewDescription: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface Message {
    type: 'question' | 'answer';
    text: string;
    audioDataUri?: string;
}

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function InterviewClientPage({
    interviewType,
    technicalSubsection,
    interviewTitle,
    interviewDescription,
    difficulty,
}: InterviewClientPageProps) {
    const [allQuestions, setAllQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [reportGenerationFailed, setReportGenerationFailed] = useState(false);
    const [questionFetchFailed, setQuestionFetchFailed] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const { setOpen: setSidebarOpen, isMobile } = useSidebar();
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();

    useEffect(() => {
        setSidebarOpen(false);
    }, [isMobile, setSidebarOpen]);

    useEffect(() => {
        if (carouselApi) {
            carouselApi.scrollTo(messages.length - 1);
        }
    }, [messages, carouselApi]);


    useEffect(() => {
        const getCameraPermission = async () => {
          if (typeof window !== 'undefined' && navigator.mediaDevices) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({video: true});
              streamRef.current = stream;
              setHasCameraPermission(true);
    
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            } catch (error) {
              console.error('Error accessing camera:', error);
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use this feature.',
              });
            }
          } else {
              setHasCameraPermission(false);
              toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
              });
          }
        };
    
        getCameraPermission();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
      }, [toast]);
    
    useEffect(() => {
        const resumeText = "Experienced Full Stack Developer with expertise in React, Node.js, and cloud technologies. Proven track record of building scalable web applications.";
        const blob = new Blob([resumeText], { type: 'text/plain' });
        const reader = new FileReader();
        reader.onload = () => {
            setResumeDataUri(reader.result as string);
        };
        reader.readAsDataURL(blob);
    }, []);

    const playQuestionAudio = (audioDataUri: string) => {
        if (audioRef.current) {
            audioRef.current.src = audioDataUri;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    };

    const askQuestion = async (questionText: string) => {
        setIsLoading(true);
        // Always set the question text immediately so the UI is not blocked by audio fetching.
        setMessages(prev => [...prev, { type: 'question', text: questionText }]);

        try {
            const { audioDataUri } = await textToSpeech(questionText);
            // Now, find the message and update it with the audio.
            setMessages(prev =>
                prev.map(msg =>
                    msg.text === questionText ? { ...msg, audioDataUri } : msg
                )
            );
            playQuestionAudio(audioDataUri);
        } catch (error: any) {
            console.error("Failed to get question audio:", error);
            const errorMessage = (error.message || '').toLowerCase();
            const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota');
            const isOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded');

            if (isQuotaError) {
                toast({
                    title: "AI Voice Limit Reached",
                    description: "The daily limit for the AI voice has been reached. The interview will continue with text.",
                    variant: "destructive"
                });
            } else if (isOverloaded) {
                toast({
                    title: "AI Voice Unavailable",
                    description: "The AI voice service is busy. Displaying question as text.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Audio Error",
                    description: "Could not fetch question audio. Displaying text only.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (allQuestions.length > 0 && currentQuestionIndex < allQuestions.length) {
          askQuestion(allQuestions[currentQuestionIndex]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestionIndex, allQuestions]);


    const getInitialQuestions = async () => {
        if (!resumeDataUri) return;
        setIsLoading(true);
        setQuestionFetchFailed(false);
        
        try {
            let questions: string[] = [];

            if (interviewType === 'hr') {
                const q = query(collection(db, "hr-questions"), where("difficulty", "==", difficulty));
                const querySnapshot = await getDocs(q);
                const dbQuestions = querySnapshot.docs.map(doc => doc.data().questionText as string);

                if (dbQuestions.length < 3) {
                    toast({ title: "Not Enough Questions", description: `There are not enough '${difficulty}' questions in the database. Please add more.`, variant: "destructive" });
                    setQuestionFetchFailed(true);
                    setIsLoading(false);
                    return;
                }
                questions = shuffleArray(dbQuestions).slice(0, 3);

            } else { // Technical interview
                const input: AiInterviewInput = {
                    resumeDataUri,
                    interviewType,
                    technicalSubsection,
                    difficulty,
                    questions: [],
                    answers: [],
                };
                const result = await aiInterview(input);
                if (result.questions) {
                    questions = result.questions;
                }
            }
            
            if (questions.length > 0) {
                setAllQuestions(questions);
                // The useEffect will now trigger to ask the first question
            } else {
                 toast({ title: "Error", description: "Could not fetch interview questions.", variant: "destructive" });
                 setQuestionFetchFailed(true);
            }
        } catch (error: any) {
            console.error("Failed to get questions:", error);
            setQuestionFetchFailed(true);
            const errorMessage = (error.message || '').toLowerCase();
            const isQuotaError = errorMessage.includes('429') || errorMessage.includes('quota');
            const isOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded');
            
            if (isQuotaError) {
                toast({
                    title: "AI Limit Reached",
                    description: "The daily limit for the AI has been reached. Please try again later.",
                    variant: "destructive"
                });
            } else if (isOverloaded) {
                toast({
                    title: "AI is Busy",
                    description: "The AI model is currently overloaded. Please try again in a moment.",
                    variant: "destructive"
                });
            } else if (errorMessage.includes('no active gemini api key')) {
                toast({
                    title: "Configuration Error",
                    description: "No active Gemini API key is configured. Please set one in the admin panel.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Could not fetch interview questions. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateAndSaveReport = async (finalAnswers: string[]) => {
        setReportGenerationFailed(false);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        if (!resumeDataUri || !user) return;
        setIsLoading(true);
        toast({ title: "Interview Complete!", description: "Generating your performance report..." });
    
        try {
            const reportInput: AiInterviewInput = {
                resumeDataUri,
                interviewType,
                technicalSubsection,
                difficulty,
                questions: allQuestions,
                answers: finalAnswers,
            };
    
            const reportResult: AiInterviewOutput = await aiInterview(reportInput);
    
            if (reportResult.report) {
                const docRef = await addDoc(collection(db, "reports"), {
                    userId: user.uid,
                    interviewType: interviewTitle,
                    difficulty: difficulty,
                    questions: allQuestions,
                    answers: finalAnswers,
                    report: reportResult.report,
                    createdAt: serverTimestamp(),
                });
    
                toast({
                    title: "Report Generated!",
                    description: "Your performance report has been saved.",
                });
    
                router.push(`/student/report/${docRef.id}`);
            } else {
                throw new Error("Report generation failed, no report content returned.");
            }
    
        } catch (error: any) {
            console.error("Failed to generate or save report:", error);
            setReportGenerationFailed(true);
            const errorMessage = (error.message || '').toLowerCase();
            const isOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded');

            if (isOverloaded) {
                toast({
                    title: "Report Generation Failed",
                    description: "The AI model is currently overloaded. Please try again in a moment.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: "Could not generate or save the report. Please try again.",
                    variant: "destructive"
                });
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (resumeDataUri) {
             getInitialQuestions();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeDataUri]);

    const handleStartRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                setIsLoading(true);

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    try {
                        const { text } = await speechToText({ audioDataUri: base64Audio });
                        handleAnswerSubmit(text);
                    } catch (error: any) {
                         console.error("Speech-to-text error:", error);
                         const errorMessage = (error.message || '').toLowerCase();
                         const isOverloaded = errorMessage.includes('503') || errorMessage.includes('overloaded');
                         
                         if (isOverloaded) {
                             toast({
                                title: "AI is Busy",
                                description: "The transcription service is overloaded. Please try answering again.",
                                variant: "destructive",
                            });
                         } else {
                            toast({
                                title: "Transcription Error",
                                description: "Could not transcribe your audio. Please try again.",
                                variant: "destructive",
                            });
                         }
                    } finally {
                        setIsLoading(false);
                    }
                }
                 
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast({ title: "Recording started..." });
        } catch (error) {
            console.error("Could not start recording:", error);
            toast({
                title: "Recording Error",
                description: "Could not access microphone. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast({ title: "Recording stopped, processing..." });
        }
    };

    const handleAnswerSubmit = (answerText: string) => {
        const updatedAnswers = [...answers, answerText];
        setAnswers(updatedAnswers);
        setMessages(prev => [...prev, { type: 'answer', text: answerText }]);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < allQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            generateAndSaveReport(updatedAnswers);
        }
    }

    const handleSkipQuestion = () => {
        handleAnswerSubmit("I would like to skip this question.");
        toast({ title: "Question skipped" });
    };
    
    const totalQuestions = allQuestions.length > 0 ? allQuestions.length : 3;
    const questionCount = currentQuestionIndex + 1;

    if (reportGenerationFailed) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
                 <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Report Generation Failed</h1>
                    <p className="text-muted-foreground mt-2 text-lg">The AI service is currently busy. You can retry generating your report.</p>
                </div>
                 <Button onClick={() => generateAndSaveReport(answers)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    <span className="ml-2">Retry Report Generation</span>
                 </Button>
            </div>
        )
    }

    if (questionFetchFailed) {
         return (
            <div className="flex flex-col flex-1 items-center justify-center text-center p-4">
                 <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold">Failed to Start Interview</h1>
                    <p className="text-muted-foreground mt-2 text-lg">There was a problem fetching questions. This could be due to network issues, or there might not be enough questions for this difficulty level in the database.</p>
                </div>
                 <Button onClick={getInitialQuestions} disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    <span className="ml-2">Retry Starting Interview</span>
                 </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="relative flex-grow-[7] flex items-center justify-center min-h-0">
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <AiFigure isAnswering={isLoading || isRecording} />
                    </div>
                    <div className="absolute top-4 right-4 w-1/4 max-w-xs z-10">
                        <video ref={videoRef} className="w-full rounded-md bg-secondary shadow-lg -scale-x-100" autoPlay muted />
                        {hasCameraPermission === false && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>

                <div className="flex-grow-[3] flex-shrink-0">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pt-2 pb-2">
                            <Progress value={(questionCount / totalQuestions) * 100} className="w-full" />
                            <p className="text-sm text-muted-foreground text-center mt-2">Question {questionCount} of {totalQuestions}</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center p-0 min-h-0">
                            <Carousel setApi={setCarouselApi} className="w-full h-full" opts={{ watchDrag: false }}>
                                <CarouselContent className="h-full">
                                    {messages.map((msg, index) => (
                                        <CarouselItem key={index} className="h-full flex items-center justify-center">
                                            <div className="p-4 text-center text-md md:text-lg">
                                                <p>{msg.text}</p>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                    {isLoading && currentQuestionIndex < totalQuestions && (
                                        <CarouselItem className="h-full flex items-center justify-center">
                                            <div className="p-4 text-center text-md md:text-lg flex items-center">
                                                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                                <span>Typing...</span>
                                            </div>
                                        </CarouselItem>
                                    )}
                                </CarouselContent>
                            </Carousel>
                        </CardContent>
                        <div className="p-2 border-t">
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={handleSkipQuestion}
                                    disabled={isLoading || isRecording}
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full w-14 h-14 sm:w-16 sm:h-16"
                                >
                                    <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                                </Button>
                                <Button
                                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                                    disabled={isLoading}
                                    size="lg"
                                    className={cn(
                                        "rounded-full w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300",
                                        isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-primary"
                                    )}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}

    