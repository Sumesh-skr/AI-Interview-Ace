
"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bot, ChevronRight, Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Vortex } from "@/components/ui/vortex";

export default function Home() {
  const router = useRouter();

  const handleDoubleClick = () => {
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative">
        <header className="absolute top-0 left-0 right-0 z-20 px-4 lg:px-6 h-14 flex items-center">
          <Link href="#" className="flex items-center justify-center" prefetch={false}>
            <Bot className="h-6 w-6 text-primary" onDoubleClick={handleDoubleClick} />
            <span className="sr-only">AI Interview Ace</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1">
          <Vortex
            backgroundColor="transparent"
            rangeY={800}
            particleCount={500}
            baseHue={260}
            className="flex items-center flex-col justify-center px-4 md:px-6 py-12 md:py-24 lg:py-32 xl:py-48 w-full h-auto"
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline text-primary">
                  AI Interview Ace
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Master your interviews with our AI-powered platform. Get instant feedback, analyze your resume, and face realistic interview simulations.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="group transition-transform duration-300 ease-in-out hover:scale-105">
                  <Link href="/login">
                    Get Started
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </Vortex>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
            <div className="container px-4 md:px-6">
              <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Resume Analysis</div>
                  <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-headline">
                    Unlock Your Resume's Potential
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                    Our AI analyzer scans your resume to extract key skills and identifies areas of strength, giving you a competitive edge.
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-4">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Mock Interviews</div>
                  <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-headline">
                    Practice Like A Pro
                  </h2>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                    Practice with our AI interviewer for both HR and technical rounds. Get customized questions based on your profile and job descriptions.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer className="border-t bg-background">
        <div className="container py-12 px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">About</h4>
              <ul className="space-y-2">
                <li><Link href="/team" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Our Team</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Organization</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">Contact</h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">• support@aiace.com</li>
                <li className="text-sm text-muted-foreground">• +91 800-500-2003</li>
                <li><Link href="/feedback" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Feedback</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Terms of Service</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary" prefetch={false}>Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Follow Us</h4>
                <div className="flex gap-4">
                    <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary" prefetch={false}><Twitter /></Link>
                    <Link href="#" aria-label="Github" className="text-muted-foreground hover:text-primary" prefetch={false}><Github /></Link>
                    <Link href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary" prefetch={false}><Linkedin /></Link>
                </div>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            &copy; 2025 AI Interview Ace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
