"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Edit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deletePlaylist, updatePlaylist } from "@/actions/playlist";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PlaylistSettingsProps {
  playlistId: string;
  playlistTitle: string;
  playlistDescription?: string;
}

export function PlaylistSettings({ playlistId, playlistTitle, playlistDescription }: PlaylistSettingsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [title, setTitle] = useState(playlistTitle);
  const [description, setDescription] = useState(playlistDescription || "");
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deletePlaylist(playlistId);
    setIsDeleting(false);
    
    if (res.success) {
      toast.success("Playlist deleted");
      router.push("/library");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await updatePlaylist(playlistId, { title, description });
    setIsUpdating(false);

    if (res.success) {
      toast.success("Playlist updated");
      setShowEditDialog(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-text hover:text-white">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-noir-terminal border-white/5 text-white">
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2.5 px-3 focus:bg-white/5 cursor-pointer rounded-lg"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Edit Playlist</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2.5 px-3 focus:bg-signal-red/10 text-signal-red cursor-pointer rounded-lg"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Delete Playlist</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-noir-terminal border-white/5 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit Playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Title</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-electric-lime"
                placeholder="Playlist Title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-text">Description</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-electric-lime min-h-[100px]"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              className="bg-white/5 border-none text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              className="bg-electric-lime text-black hover:bg-electric-lime/90 font-bold uppercase tracking-widest"
              disabled={isUpdating || !title.trim()}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-noir-terminal border-white/5 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Delete Playlist?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-text">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{playlistTitle}&quot;</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-none text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-signal-red text-white hover:bg-signal-red/80 font-bold"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
