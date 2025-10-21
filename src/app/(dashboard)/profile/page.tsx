
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { GradientCard } from "@/components/ui/gradient-card";

export default function ProfilePage() {
    const { userDetails, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!userDetails) {
        return (
            <PageHeader title="Profile Not Found" description="Could not load user details." />
        );
    }

    const { fullName, email, age, profession, instituteOrOrganization, role, createdAt } = userDetails;
    const formattedDate = createdAt ? format(new Date(createdAt.seconds * 1000), 'dd/MM/yyyy hh:mm:ss a') : "N/A";

    return (
        <div>
            <PageHeader title="My Profile" description="Your personal and account details." />

            <GradientCard className="max-w-2xl mx-auto">
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader>
                        <div className="flex flex-col items-center gap-6">
                            <Avatar className="w-32 h-32 text-4xl">
                                <AvatarImage src={undefined} />
                                <AvatarFallback>{fullName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <CardTitle className="text-3xl font-headline">{fullName}</CardTitle>
                                <CardDescription className="text-lg">{email}</CardDescription>
                                <Badge className="mt-2 capitalize" variant={role === 'hr' ? 'destructive' : 'default'}>{role}</Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Age</p>
                                <p className="font-medium">{age}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-muted-foreground">Profession</p>
                                <p className="font-medium capitalize">{profession}</p>
                            </div>
                            <div className="space-y-1 col-span-1 sm:col-span-2">
                                <p className="text-muted-foreground">Institute / Organization</p>
                                <p className="font-medium">{instituteOrOrganization}</p>
                            </div>
                            <div className="space-y-1 col-span-1 sm:col-span-2">
                                <p className="text-muted-foreground">Account Created</p>
                                <p className="font-medium">{formattedDate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </GradientCard>
        </div>
    );
}
