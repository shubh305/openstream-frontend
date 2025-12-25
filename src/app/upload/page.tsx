import { UploadForm } from "@/features/upload/components/UploadForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-noir-border bg-noir-terminal px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-text hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium text-foreground">Upload video</h1>
        </div>
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-muted-text hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* Upload Form */}
      <div className="flex-1 overflow-hidden">
        <UploadForm />
      </div>
    </div>
  );
}
