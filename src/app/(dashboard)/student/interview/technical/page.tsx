
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Code, Cpu, Database, Server, Smartphone, Router } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { GradientCard } from "@/components/ui/gradient-card";

const subsections = [
    { name: "Full Stack", icon: Code, href: "/student/interview/technical/full-stack" },
    { name: "Frontend", icon: Smartphone, href: "/student/interview/technical/frontend" },
    { name: "Backend", icon: Server, href: "/student/interview/technical/backend" },
    { name: "AI/ML", icon: BrainCircuit, href: "/student/interview/technical/ai-ml" },
    { name: "Data Science", icon: Database, href: "/student/interview/technical/data-science" },
    { name: "Java", icon: Cpu, href: "/student/interview/technical/java" },
    { name: "Python", icon: Cpu, href: "/student/interview/technical/python" },
    { name: "C++", icon: Cpu, href: "/student/interview/technical/cpp" },
    { name: "IoT", icon: Router, href: "/student/interview/technical/iot" },
];

export default function TechnicalInterviewSelectionPage() {
    return (
        <div className="container mx-auto">
            <PageHeader
                title="Technical Interview"
                description="Select a category to start your technical mock interview."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subsections.map((subsection) => (
                    <Link href={subsection.href} key={subsection.name} className="group">
                         <GradientCard>
                            <Card className="h-full transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/20 border-none shadow-none bg-transparent">
                                <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                                    <subsection.icon className="w-12 h-12 mb-4 text-primary" />
                                    <CardTitle className="font-headline text-xl">{subsection.name}</CardTitle>
                                </CardHeader>
                            </Card>
                        </GradientCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
