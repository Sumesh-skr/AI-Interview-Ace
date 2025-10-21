
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FirebaseError } from "firebase/app";
import { NeonGlow } from "@/components/ui/neon-glow";

type Role = 'student' | 'hr';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, role);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push(role === 'student' ? '/student/dashboard' : '/hr/dashboard');
    } catch (error: any) {
      console.error(error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          toast({
            title: "Account Not Found",
            description: "No account found with this email. Please register.",
            variant: "destructive",
          });
          router.push('/register');
        } else if (error.code === 'auth/invalid-credential') {
          toast({
            title: "Login Failed",
            description: "Invalid credentials. Please check your email and password.",
            variant: "destructive",
          });
        } else if (error.code === 'auth/configuration-not-found') {
           toast({
              title: "Configuration Error",
              description: "Email/Password sign-in is not enabled in the Firebase console.",
              variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
         toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred. Please try again.",
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
          <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Log in to continue to AI Interview Ace</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(value) => setRole(value as Role)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="hr">HR</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input id="student-email" type="email" placeholder="student@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative">
                    <Input id="student-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                  <span className="ml-2">Log In as Student</span>
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="hr">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="hr-email">Email</Label>
                  <Input id="hr-email" type="email" placeholder="hr@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hr-password">Password</Label>
                  <div className="relative">
                    <Input id="hr-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
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
                  <span className="ml-2">Log In as HR</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </NeonGlow>
  );
}
