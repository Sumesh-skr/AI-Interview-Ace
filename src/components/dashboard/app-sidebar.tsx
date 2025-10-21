
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bot, Briefcase, Calendar, History, Home, MessageSquare, PanelLeftClose, PanelLeftOpen, PieChart, User, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";

const studentNav = [
  { href: "/student/dashboard", icon: Home, label: "Dashboard" },
  { href: "/student/interview", icon: MessageSquare, label: "AI Interview" },
  { href: "/student/reports", icon: PieChart, label: "Reports" },
  { href: "/student/meetings", icon: Calendar, label: "Meetings" },
  { href: "/resume-analysis-history", icon: History, label: "Resume History"},
  { href: "/student/all-hrs", icon: Users, label: "All HRs" },
  { href: "/profile", icon: User, label: "Profile" },
];

const hrNav = [
  { href: "/hr/dashboard", icon: Home, label: "Dashboard" },
  { href: "/hr/schedule", icon: Calendar, label: "Schedule" },
  { href: "/resume-analysis-history", icon: History, label: "Resume History"},
  { href: "/hr/all-students", icon: Users, label: "All Students" },
  { href: "/profile", icon: User, label: "Profile" },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { userRole } = useAuth();
  const { state } = useSidebar();
  
  const isHr = userRole === 'hr';

  const navItems = isHr ? hrNav : studentNav;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Bot className="size-8 text-primary" />
            <span className="text-lg font-headline font-semibold group-data-[collapsible=icon]:hidden">AI Interview Ace</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                className="text-foreground"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
        <SidebarTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
                {state === "collapsed" ? <PanelLeftOpen /> : <PanelLeftClose />}
                <span className="group-data-[collapsible=icon]:hidden">Collapse</span>
            </Button>
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}
