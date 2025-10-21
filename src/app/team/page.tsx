
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const teamSections = [
    {
        title: "Project Leads",
        members: [
            { name: "Alex Johnson", branch: "Computer Science", year: "4th Year", image: "1" },
            { name: "Brenda Smith", branch: "Electrical Engineering", year: "4th Year", image: "2" },
            { name: "Charles Brown", branch: "Data Science", year: "3rd Year", image: "3" },
        ]
    },
    {
        title: "Frontend Developers",
        members: [
            { name: "Diana Prince", branch: "Information Technology", year: "3rd Year", image: "4" },
            { name: "Edward King", branch: "Computer Engineering", year: "3rd Year", image: "5" },
            { name: "Fiona Queen", branch: "Computer Science", year: "2nd Year", image: "6" },
        ]
    },
    {
        title: "Backend Developers",
        members: [
            { name: "George Stone", branch: "Computer Science", year: "3rd Year", image: "7" },
            { name: "Helen Troy", branch: "Software Engineering", year: "4th Year", image: "8" },
            { name: "Ian Knight", branch: "Computer Science", year: "2nd Year", image: "9" },
        ]
    },
    {
        title: "AI/ML Engineers",
        members: [
            { name: "Jessica Lord", branch: "AI & Machine Learning", year: "4th Year", image: "10" },
            { name: "Kevin Hart", branch: "Data Science", year: "3rd Year", image: "11" },
            { name: "Laura Croft", branch: "Computer Engineering", year: "3rd Year", image: "12" },
        ]
    },
    {
        title: "UI/UX Designers",
        members: [
            { name: "Mike Ross", branch: "Design", year: "3rd Year", image: "13" },
            { name: "Nora Allen", branch: "Graphic Design", year: "2nd Year", image: "14" },
            { name: "Oscar Wilde", branch: "Human-Computer Interaction", year: "4th Year", image: "15" },
        ]
    }
];

const TeamMemberCard = ({ name, branch, year, image }: { name: string, branch: string, year: string, image: string }) => (
    <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col items-center text-center">
            <Image
                src={`https://picsum.photos/seed/${image}/200/200`}
                data-ai-hint="person portrait"
                alt={`Portrait of ${name}`}
                width={128}
                height={128}
                className="rounded-full mb-4 border-4 border-secondary"
            />
            <h3 className="text-xl font-semibold font-headline">{name}</h3>
            <p className="text-muted-foreground">{branch}</p>
            <p className="text-sm text-muted-foreground">{year}</p>
        </CardContent>
    </Card>
);


export default function TeamPage() {
    return (
        <div className="container mx-auto py-12">
            <PageHeader title="Our Team" description="The brilliant minds behind AI Interview Ace." />
            <div className="space-y-16">
                {teamSections.map((section, index) => (
                    <section key={index}>
                        <h2 className="text-3xl font-bold font-headline mb-8 text-center">{section.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                            {section.members.map((member) => (
                                <TeamMemberCard key={member.name} {...member} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    )
}
