import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bot } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="flex items-center gap-2 sm:hidden">
            <Bot className="size-6 text-primary" />
            <span className="font-headline text-md font-semibold">AI Ace</span>
        </div>
        <div className="relative ml-auto flex flex-1 md:grow-0 items-center gap-2">
            <div className="flex-1" />
            <ThemeToggle />
            <UserNav />
        </div>
    </header>
  );
}
