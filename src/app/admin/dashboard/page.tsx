
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";

export default function AdminDashboardPage() {
    return (
        <div>
            <PageHeader title="Admin Dashboard" description="Welcome to the admin control panel." />
            <GradientCard>
                <Card className="border-none shadow-none bg-transparent">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This is the admin dashboard. More features will be added here soon.</p>
                    </CardContent>
                </Card>
            </GradientCard>
        </div>
    )
}
