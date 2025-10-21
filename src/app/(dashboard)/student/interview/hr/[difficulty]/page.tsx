
"use client";

import { InterviewClientPage } from "@/components/interview/interview-client-page";
import { useParams } from "next/navigation";

export default function HrInterviewPage() {
    const params = useParams();
    const difficulty = params.difficulty as 'easy' | 'medium' | 'hard';
    const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    if (!difficulty) {
        return <div>Loading...</div>;
    }

    return (
        <InterviewClientPage
            interviewType="hr"
            interviewTitle="HR Interview"
            interviewDescription={`A ${difficulty} level HR interview.`}
            difficulty={difficulty}
        />
    );
}
