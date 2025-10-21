
"use client"

import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/dashboard/header";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Shield, KeyRound } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { Home } from "lucide-react";


function AdminSidebar() {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2 p-2">
                    <Shield className="size-8 text-primary" />
                    <span className="text-lg font-headline font-semibold group-data-[collapsible=icon]:hidden">Admin Panel</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"} tooltip="Dashboard">
                             <Link href="/admin/dashboard">
                                <Home />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/admin/gemini-keys"} tooltip="Gemini Keys">
                             <Link href="/admin/gemini-keys">
                                <KeyRound />
                                <span>Gemini Keys</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    );
}


function ProtectedAdminLayout({ children }: { children: ReactNode }) {
    const { user, loading, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/admin/login');
            } else if (userRole !== 'admin') {
                router.push('/login');
            }
        }
    }, [user, loading, userRole, router]);

    if (loading || !user || userRole !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedAdminLayout>{children}</ProtectedAdminLayout>
  );
}
