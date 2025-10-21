
"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { useParams } from "next/navigation";
import { GradientCard } from "@/components/ui/gradient-card";

const difficultyLevels = [
    {
        name: "Easy",
        description: "Fundamental questions to test basic knowledge.",
        color: "text-green-400",
        shadow: "hover:shadow-green-500/20"
    },
    {
        name: "Medium",
        description: "Complex problems and in-depth technical scenarios.",
        color: "text-yellow-400",
        shadow: "hover:shadow-yellow-500/20"
    },
    {
        name: "Hard",
        description: "Advanced, multi-part questions for experts.",
        color: "text-red-400",
        shadow: "hover:shadow-red-500/20"
    },
];

function formatSlug(slug: string) {
    if (!slug) return "";
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


export default function TechnicalInterviewDifficultyPage() {
    const params = useParams();
    const slug = params.slug as string;
    const title = formatSlug(slug);

    return (
        <div className="flex flex-col items-center justify-center">
            <PageHeader
                title={`${title} Interview`}
                description="Select a difficulty level to begin."
            />
            <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl">
                {difficultyLevels.map((level) => (
                    <Link href={`/student/interview/technical/${slug}/${level.name.toLowerCase()}`} key={level.name} className="group">
                        <GradientCard>
                            <Card className={`h-full transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl ${level.shadow} border-none shadow-none bg-transparent`}>
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <div className="flex-1">
                                        <CardTitle className={`font-headline text-2xl mb-2 ${level.color}`}>{level.name}</CardTitle>
                                        <CardDescription>{level.description}</CardDescription>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                                </CardHeader>
                            </Card>
                        </GradientCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
