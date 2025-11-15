"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSent(true);
        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 dark:bg-black">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
                    <CardDescription>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                
                {isSent ? (
                     <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                             <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-center text-sm text-neutral-500">
                            If an account exists for that email, we have sent a password reset link.
                        </p>
                        <Button className="w-full" asChild variant="outline">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                            </Button>
                            <p className="px-8 text-center text-sm text-neutral-500 hover:text-neutral-600">
                                <Link href="/login" className="flex items-center justify-center gap-2 hover:text-primary">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Login
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    );
}
