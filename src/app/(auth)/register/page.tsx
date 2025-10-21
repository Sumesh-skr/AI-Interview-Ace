
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FirebaseError } from "firebase/app";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NeonGlow } from "@/components/ui/neon-glow";

type Profession = 'student' | 'working professional' | 'others';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "hr">("student");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [profession, setProfession] = useState<Profession | "">("");
  const [instituteOrOrganization, setInstituteOrOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession) {
        toast({
            title: "Registration Failed",
            description: "Please select a profession.",
            variant: "destructive"
        });
        return;
    }
    setIsLoading(true);
    try {
      await register(email, password, role, {
        fullName,
        age: parseInt(age, 10),
        profession,
        instituteOrOrganization
      });
      toast({
        title: "Registration Successful",
        description: "You can now log in with your credentials.",
      });
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/configuration-not-found') {
          toast({
            title: "Configuration Error",
            description: "Email/Password sign-in is not enabled in the Firebase console.",
            variant: "destructive",
          });
        } else if (error.code === 'auth/email-already-in-use') {
           toast({
            title: "Registration Failed",
            description: "This email is already in use. Please log in instead.",
            variant: "destructive",
          });
          router.push('/login');
        } else {
          toast({
            title: "Registration Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeonGlow className="w-full max-w-lg mx-auto my-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Join AI Interview Ace to start your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label>I am a...</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "student" | "hr")}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="role-student" />
                  <Label htmlFor="role-student">Student / Working Professional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hr" id="role-hr" />
                  <Label htmlFor="role-hr">HR Professional</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Sumesh Sarkar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Make Strong Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Select onValueChange={(value) => setProfession(value as Profession)} value={profession}>
                  <SelectTrigger id="profession">
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="working professional">Working Professional</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institute">Institute / Organization</Label>
                <Input
                  id="institute"
                  type="text"
                  placeholder="University of Example"
                  value={instituteOrOrganization}
                  onChange={(e) => setInstituteOrOrganization(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus />}
              <span className="ml-2">Register</span>
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </NeonGlow>
  );
}
