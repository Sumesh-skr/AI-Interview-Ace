
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GradientCard } from "@/components/ui/gradient-card";

const difficultyLevels = [
    {
        name: "Easy",
        description: "Focus on fundamental concepts and behavioral questions.",
        href: "/student/interview/hr/easy",
        color: "text-green-400",
        shadow: "hover:shadow-green-500/20"
    },
    {
        name: "Medium",
        description: "More complex scenarios and in-depth skill evaluation.",
        href: "/student/interview/hr/medium",
        color: "text-yellow-400",
        shadow: "hover:shadow-yellow-500/20"
    },
    {
        name: "Hard",
        description: "Challenging problems and advanced behavioral analysis.",
        href: "/student/interview/hr/hard",
        color: "text-red-400",
        shadow: "hover:shadow-red-500/20"
    },
];

export default function HrInterviewDifficultyPage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <PageHeader
                title="HR Interview"
                description="Select a difficulty level to begin."
            />
            <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl">
                {difficultyLevels.map((level) => (
                    <Link href={level.href} key={level.name} className="group">
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
