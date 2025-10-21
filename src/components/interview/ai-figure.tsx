
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AiFigureProps {
    isAnswering: boolean;
}

export function AiFigure({ isAnswering }: AiFigureProps) {
    return (
        <div className="relative w-full h-full max-w-full max-h-full">
            <div className="relative w-full h-full mx-auto">
                <div className={cn(
                    "absolute inset-0 rounded-md bg-primary transition-all duration-1000",
                    isAnswering ? "animate-pulse scale-105 opacity-50" : "opacity-20 scale-100"
                )} />
                <Image
                    src="https://picsum.photos/seed/ai-figure/600/800"
                    data-ai-hint="robot futuristic"
                    alt="AI Interviewer"
                    layout="fill"
                    objectFit="cover"
                    className="relative rounded-md border-4 border-background p-1"
                />
            </div>
        </div>
    );
}
