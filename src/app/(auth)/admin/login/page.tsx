
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Eye, EyeOff, Shield } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { NeonGlow } from "@/components/ui/neon-glow";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, 'admin');
      toast({
        title: "Admin Login Successful",
        description: "Welcome, Administrator!",
      });
      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error(error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-credential') {
            toast({
                title: "Login Failed",
                description: "Invalid credentials or you do not have admin privileges.",
                variant: "destructive",
            });
        } else {
          toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      } else {
         toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeonGlow className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-primary"/>
            </div>
            <CardTitle className="text-3xl font-headline">Admin Access</CardTitle>
            <CardDescription>Enter your administrator credentials.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                <Input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
                <span className="ml-2">Log In as Admin</span>
            </Button>
            </form>
        </CardContent>
      </Card>
    </NeonGlow>
  );
}
