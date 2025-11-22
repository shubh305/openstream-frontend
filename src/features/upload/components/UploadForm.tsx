"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, FileVideo, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * UploadForm Component
 * 
 * Handles video file selection and metadata entry for new uploads.
 * Features:
 * - Drag and drop zone
 * - File validation (video/*)
 * - Simulated upload progress
 * - Preview generation
 */
export function UploadForm() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "complete">("idle");

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("video/")) {
            setFile(droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startUpload = () => {
        if (!file) return;
        setStatus("uploading");
        
        // Mock upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setStatus("processing");
                setTimeout(() => setStatus("complete"), 2000);
            }
        }, 500);
    };

    if (status === "complete") {
        return (
             <Card className="mx-auto w-full max-w-xl text-center">
                <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Upload Complete!</h2>
                    <p className="mb-6 text-neutral-500">Your video is now being processed.</p>
                    <Button onClick={() => { setFile(null); setStatus("idle"); setUploadProgress(0); }}>
                        Upload Another
                    </Button>
                </CardContent>
             </Card>
        );
    }

    return (
        <Card className="mx-auto w-full max-w-xl">
            <CardContent className="space-y-6 pt-6">
                {!file ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 py-16 text-center transition-colors dark:border-neutral-800",
                            isDragging && "border-primary bg-primary/5"
                        )}
                    >
                        <div className="mb-4 rounded-full bg-neutral-100 p-4 dark:bg-neutral-900">
                            <CloudUpload className="h-8 w-8 text-neutral-500" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold">
                            Drag and drop your video
                        </h3>
                        <p className="mb-6 text-sm text-neutral-500">
                            or click to browse local files
                        </p>
                        <div className="relative">
                            <Button>Select File</Button>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 rounded-lg border p-4 dark:border-neutral-800">
                            <div className="rounded bg-neutral-100 p-2 dark:bg-neutral-900">
                                <FileVideo className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{file.name}</p>
                                <p className="text-xs text-neutral-500">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                            {status === "idle" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => setFile(null)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>

                        {status === "idle" ? (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input placeholder="Video Title" defaultValue={file.name.split('.')[0]} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea 
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell viewers about your video"
                                    />
                                </div>
                                <Button onClick={startUpload} className="w-full">
                                    Start Upload
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{status === "uploading" ? "Uploading..." : "Processing..."}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
