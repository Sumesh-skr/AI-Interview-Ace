
"use client";

import { InterviewClientPage } from "@/components/interview/interview-client-page";
import { useParams } from "next/navigation";

function formatSlug(slug: string) {
    if (!slug) return "";
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function TechnicalInterviewPage() {
    const params = useParams();
    const slug = params.slug as string;
    const difficulty = params.difficulty as 'easy' | 'medium' | 'hard';
    const title = formatSlug(slug);

    if (!slug || !difficulty) {
        return <div>Loading...</div>;
    }

    return (
        <InterviewClientPage
            interviewType="technical"
            technicalSubsection={title}
            interviewTitle={`${title} Interview`}
            interviewDescription={`A ${difficulty} level technical interview for ${title}.`}
            difficulty={difficulty}
        />
    );
}
