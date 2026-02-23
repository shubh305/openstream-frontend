"use client";

import { useState } from "react";
import { ListPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPlaylist } from "@/actions/playlist";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreatePlaylistButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    const res = await createPlaylist(title, description);
    setIsLoading(false);

    if (res) {
      toast.success("Playlist created");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("Failed to create playlist");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-electric-lime text-black hover:bg-white font-bold px-6">
          <ListPlus className="w-4 h-4 mr-2" /> New Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-noir-terminal border-white/5 text-white sm:max-w-[425px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Create Playlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="My Awesome Playlist"
                required
                className="bg-black/50 border-white/5 focus:border-electric-lime text-white placeholder:text-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-text">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What's this collection about?"
                className="bg-black/50 border-white/5 focus:border-electric-lime text-white placeholder:text-white/20 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-electric-lime text-black hover:bg-white font-bold uppercase tracking-[0.1em]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ListPlus className="w-4 h-4 mr-2" />}
              Create Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
