
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Code, ChevronRight } from "lucide-react";
import Link from "next/link";
import { GradientCard } from "@/components/ui/gradient-card";

const interviewTypes = [
    {
        title: "HR Interview",
        description: "Assess communication, behavior, and situational judgment.",
        icon: Briefcase,
        href: "/student/interview/hr",
        color: "text-blue-400",
        shadow: "hover:shadow-blue-500/20"
    },
    {
        title: "Technical Interview",
        description: "Test your knowledge in specific tech domains.",
        icon: Code,
        href: "/student/interview/technical",
        color: "text-purple-400",
        shadow: "hover:shadow-purple-500/20"
    }
];

export default function InterviewSelectionPage() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Choose Your Interview</h1>
                <p className="text-muted-foreground mt-2 text-lg">Select the type of mock interview you want to practice.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                {interviewTypes.map((type) => (
                    <Link href={type.href} key={type.title} className="group">
                        <GradientCard>
                            <Card className={`h-full transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl ${type.shadow} border-none shadow-none bg-transparent`}>
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <type.icon className={`w-12 h-12 flex-shrink-0 ${type.color}`} />
                                    <div className="flex-1">
                                        <CardTitle className="font-headline text-2xl mb-2">{type.title}</CardTitle>
                                        <CardDescription>{type.description}</CardDescription>
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
