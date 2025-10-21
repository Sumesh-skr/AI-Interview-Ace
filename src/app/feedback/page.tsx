
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/dashboard/page-header';

export default function FeedbackPage() {
    const [heading, setHeading] = useState('');
    const [content, setContent] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Feedback Submitted",
            description: "Thank you for your valuable feedback!",
        });
        // Redirect to landing page after a short delay
        setTimeout(() => {
            router.push('/');
        }, 1500);
    };

    return (
        <div className="container mx-auto py-12">
            <PageHeader title="Submit Feedback" description="We'd love to hear your thoughts." />
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Feedback Form</CardTitle>
                    <CardDescription>Let us know how we can improve AI Interview Ace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="feedback-heading">Heading</Label>
                            <Input 
                                id="feedback-heading"
                                placeholder="A short title for your feedback"
                                value={heading}
                                onChange={(e) => setHeading(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback-content">Content</Label>
                            <Textarea 
                                id="feedback-content"
                                placeholder="Describe your feedback in detail..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows={8}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Submit Feedback
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
