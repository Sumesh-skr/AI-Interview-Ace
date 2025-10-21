
"use client"

import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Header } from "@/components/dashboard/header";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function ProtectedLayout({ children }: { children: ReactNode }) {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);
    
    useEffect(() => {
        if (!loading && user && userRole) {
            const isHrRoute = pathname.startsWith('/hr');
            const isStudentRoute = pathname.startsWith('/student');
            const isAdminRoute = pathname.startsWith('/admin');

            if (isHrRoute && userRole !== 'hr') {
                router.push(userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard');
            } else if (isStudentRoute && userRole !== 'student') {
                 router.push(userRole === 'admin' ? '/admin/dashboard' : '/hr/dashboard');
            } else if (isAdminRoute && userRole !== 'admin') {
                router.push('/login');
            }
        }
    }, [user, loading, userRole, pathname, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout>{children}</ProtectedLayout>
  );
}
