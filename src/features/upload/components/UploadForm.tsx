"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileVideo, Check, Copy, Globe, Lock, Users, ArrowLeft, ChevronRight, Loader2, Info, Pause, Play, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIP_LIMITS } from "@/lib/wip-limits";
import { toast } from "@/components/ui/sonner";
import { fetchApi } from "@/lib/api-client";
import { getAccessToken } from "@/actions/auth";
import { useFileValidator } from "@/hooks/useFileValidator";
import { useChunkedUpload } from "@/hooks/useChunkedUpload";

type Visibility = "public" | "unlisted" | "private";

const CATEGORIES = ["Gaming", "Music", "Entertainment", "Education", "Sports", "Tech", "Vlogs", "Other"];

export function UploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [category, setCategory] = useState("Gaming");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation hook
  const { validate } = useFileValidator();

  // TUS chunked upload hook
  // TODO: Pass real JWT token from auth context
  const upload = useChunkedUpload({
    token: "",
  });

  // Handle upload errors via toast
  useEffect(() => {
    if (upload.error) {
      toast.error("Upload failed", {
        description: upload.error.length > 80 ? "The server encountered an error. Please try again." : upload.error,
      });
    }
  }, [upload.error]);

  const videoUrl = upload.sessionId ? `https://openstream.octanebrew.dev/watch/${upload.sessionId}` : "";

  const handleFile = async (selectedFile: File) => {
    const result = await validate(selectedFile);
    if (!result.valid) {
      toast.error("Invalid file", {
        description: result.error,
        icon: <AlertCircle className="w-4 h-4 text-signal-red" />,
      });
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));

    upload.startUpload(selectedFile);
  };

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
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const copyLink = async () => {
    if (!videoUrl) return;
    await navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    upload.cancelUpload();
    setFile(null);
    setTitle("");
    setDescription("");
    setVisibility("private");
    setIsPublishing(false);
  };

  const handlePublish = async () => {
    if (!upload.videoId) return;

    setIsPublishing(true);
    try {
      const token = await getAccessToken();
      await fetchApi(
        `/videos/${upload.videoId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            visibility,
            category,
            status: "published",
          }),
        },
        token || undefined,
      );

      toast.success("Video published successfully!", {
        description: "Your video is now available for viewers.",
      });

      resetForm();
    } catch (err) {
      toast.error("Failed to publish video", {
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isUploading = upload.status === "uploading" || upload.status === "validating";
  const isPaused = upload.status === "paused";
  const isComplete = upload.status === "complete";
  const isError = upload.status === "error";

  // Initial drag-drop state
  if (!file) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn("flex flex-col items-center justify-center w-full max-w-lg py-20 transition-all", isDragging && "scale-105")}
          >
            {/* Upload Icon Circle */}
            <div
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all",
                isDragging ? "bg-electric-lime/20 border-2 border-electric-lime" : "bg-noir-terminal border border-noir-border",
              )}
            >
              <Upload className={cn("w-12 h-12 transition-colors", isDragging ? "text-electric-lime" : "text-muted-text")} />
            </div>

            <h2 className="text-xl font-medium text-foreground mb-2">Drag and drop video files to upload</h2>
            <p className="text-sm text-muted-text mb-8">Your videos will be private until you publish them</p>

            <div className="relative">
              <Button onClick={() => fileInputRef.current?.click()} className="bg-foreground text-background hover:bg-electric-lime px-8 h-12 font-medium">
                Select files
              </Button>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-noir-border p-4 text-center text-xs text-muted-text">
          By submitting your videos, you acknowledge that you agree to OpenStream&apos;s <span className="text-electric-lime cursor-pointer hover:underline">Terms of Service</span>
        </div>
      </div>
    );
  }

  // Form state after file selection
  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-medium text-foreground mb-6">Details</h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm text-muted-text mb-2 block">
                  Title <span className="text-signal-red">*</span>
                </label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Add a title that describes your video"
                  className="bg-noir-bg border-noir-border focus:border-electric-lime h-12"
                />
                <div className="text-xs text-muted-text mt-1 text-right">{title.length}/100</div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm text-muted-text mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell viewers about your video"
                  rows={4}
                  className="w-full bg-noir-bg border border-noir-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-text/50 focus:border-electric-lime focus:outline-none resize-none"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="text-sm text-muted-text mb-3 block">Visibility</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      id: "private",
                      label: "Private",
                      desc: "Only you",
                      icon: Lock,
                    },
                    {
                      id: "unlisted",
                      label: "Unlisted",
                      desc: "Anyone with link",
                      icon: Users,
                    },
                    {
                      id: "public",
                      label: "Public",
                      desc: "Everyone",
                      icon: Globe,
                    },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setVisibility(opt.id as Visibility)}
                      className={cn("p-4 rounded-lg border text-left transition-all", visibility === opt.id ? "border-electric-lime bg-electric-lime/5" : "border-noir-border hover:border-muted-text")}
                    >
                      <opt.icon className={cn("w-5 h-5 mb-2", visibility === opt.id ? "text-electric-lime" : "text-muted-text")} />
                      <div className={cn("text-sm font-medium", visibility === opt.id ? "text-foreground" : "text-muted-text")}>{opt.label}</div>
                      <div className="text-xs text-muted-text">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm text-muted-text mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-noir-bg border border-noir-border text-foreground rounded-lg h-12 px-4 text-sm focus:border-electric-lime focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Video Preview */}
            <div className="lg:col-span-2">
              <div className="bg-noir-terminal border border-noir-border rounded-lg overflow-hidden sticky top-6">
                {/* Preview Area */}
                <div className="aspect-video bg-noir-bg flex items-center justify-center">
                  {isComplete ? (
                    <div className="text-center">
                      <FileVideo className="w-12 h-12 text-electric-lime mx-auto mb-2" />
                      <p className="text-sm text-muted-text">Upload complete</p>
                    </div>
                  ) : isError ? (
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-signal-red mx-auto mb-2" />
                      <p className="text-sm text-signal-red">Upload failed</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-muted-text animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-text">{isPaused ? "Paused" : upload.status === "validating" ? "Validating..." : "Uploading..."}</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-muted-text mb-1">Filename</div>
                    <div className="text-sm text-foreground truncate">{file?.name}</div>
                  </div>

                  {/* Upload Progress Bar */}
                  {(isUploading || isPaused) && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-text mb-1">
                        <span>
                          {formatBytes(upload.bytesUploaded)} / {formatBytes(upload.bytesTotal)}
                        </span>
                        <span>{upload.progress}%</span>
                      </div>
                      <div className="w-full bg-noir-bg rounded-full h-1.5 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-300", isPaused ? "bg-amber-500" : "bg-electric-lime")} style={{ width: `${upload.progress}%` }} />
                      </div>
                    </div>
                  )}

                  {videoUrl && (
                    <div>
                      <div className="text-xs text-muted-text mb-1">Video link</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-electric-lime truncate">{videoUrl}</div>
                        <button onClick={copyLink} className="text-muted-text hover:text-foreground transition-colors">
                          {copied ? <Check className="w-4 h-4 text-electric-lime" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="border-t border-noir-border bg-noir-terminal px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: Progress & Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-muted-text" />
              <span className="text-xs font-medium text-muted-text border border-noir-border px-2 py-0.5 rounded">HD</span>
              {isComplete ? (
                <Check className="w-4 h-4 text-electric-lime" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4 text-signal-red" />
              ) : (
                <Loader2 className="w-4 h-4 text-muted-text animate-spin" />
              )}
            </div>
            <span className="text-sm text-muted-text">
              {upload.status === "validating" && "Validating..."}
              {upload.status === "uploading" && `Uploading ${upload.progress}%...`}
              {isPaused && `Paused at ${upload.progress}%`}
              {isComplete && "Upload complete"}
              {isError && "Upload failed"}
            </span>

            {/* Pause / Resume buttons */}
            {isUploading && upload.status !== "validating" && (
              <Button variant="ghost" size="sm" onClick={upload.pauseUpload} className="h-8 w-8 p-0">
                <Pause className="w-4 h-4" />
              </Button>
            )}
            {isPaused && (
              <Button variant="ghost" size="sm" onClick={upload.resumeUpload} className="h-8 w-8 p-0">
                <Play className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={resetForm} className="h-10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              disabled={!isComplete || isPublishing}
              onClick={() => {
                if (!WIP_LIMITS.showPublishFeature) {
                  toast.info("Feature in development", {
                    description: "Recording and publishing your own videos is coming soon!",
                    icon: <Info className="w-4 h-4 text-electric-lime" />,
                  });
                  return;
                }
                handlePublish();
              }}
              className="bg-foreground text-background hover:bg-electric-lime h-10 px-6"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : isComplete ? (
                "Publish"
              ) : (
                "Save"
              )}
              {!isPublishing && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
