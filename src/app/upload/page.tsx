import { UploadForm } from "@/features/upload/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-white/95 px-4 backdrop-blur dark:bg-neutral-950/95 dark:border-neutral-800">
            <div className="font-bold text-lg tracking-tight">OpenStream Studio</div>
        </header>

        <div className="container mx-auto max-w-5xl py-10 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Upload Content</h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Share your videos with the world.
                </p>
            </div>
            
            <UploadForm />
        </div>
    </div>
  );
}
