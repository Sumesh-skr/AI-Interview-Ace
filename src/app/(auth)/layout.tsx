import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <Button asChild variant="ghost" className="absolute top-4 left-4">
        <Link href="/">
          <Home className="mr-2" />
          <span>Back to Home</span>
        </Link>
      </Button>
      {children}
    </div>
  );
}
