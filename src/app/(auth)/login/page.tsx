"use client";

import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    
    // We can't use `useActionState` yet since React 19 types might be unstable in this env, 
    // sticking to simple state for this mock
    
    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        // We invoke the server action directly
        // In a real app we'd handle errors here
        await login(formData);
        // Redirect happens on server
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 dark:bg-black">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <form action={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required defaultValue="demo@example.com" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                <Link 
                                    href="/forgot-password" 
                                    className="text-sm text-neutral-500 hover:text-primary underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required defaultValue="password" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                         <Button className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                        <p className="px-8 text-center text-sm text-neutral-500 hover:text-neutral-600">
                            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                                Don&apos;t have an account? Sign Up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
