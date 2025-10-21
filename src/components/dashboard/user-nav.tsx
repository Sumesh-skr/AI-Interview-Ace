
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export function UserNav() {
  const { user, logout, userRole } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    // Redirect logic is handled by the layout now
  };
  
  const profileHref = userRole === 'admin' && pathname.startsWith('/admin') ? "/admin/profile" : "/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://picsum.photos/100" alt="@shadcn" data-ai-hint="person" />
            <AvatarFallback>{user?.email?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Authenticated User
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={profileHref} passHref>
            <DropdownMenuItem>
              <User className="mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem disabled>
            <Settings className="mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2" />
            Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
