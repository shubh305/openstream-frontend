"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { Comment } from "@/types/api"; // Ensure using API type
import { postComment } from "@/actions/comment";
import { User } from "@/types/api";

interface CommentSectionProps {
  videoId: string;
  initialComments: Comment[];
  currentUser?: User | null;
}

export function CommentSection({ videoId, initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    const result = await postComment(videoId, newComment);
    setIsSubmitting(false);

    if (result.success) {
      setNewComment("");
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        text: newComment,
        timestamp: "Just now",
        likes: 0,
        replyCount: 0,
        isLiked: false,
        author: {
           username: currentUser.username,
           avatarUrl: currentUser.avatarUrl
        }
      };
      
      setComments([optimisticComment, ...comments]);
    } else {
        alert("Failed to post comment");
    }
  };

  return (
    <section className="mt-8 border-t border-noir-border pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">
          {comments.length} comments
        </h3>
        <button className="text-xs text-muted-text hover:text-white flex items-center gap-1 transition-colors">
          Newest first
        </button>
      </div>

      {/* Comment Input */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 group/form">
            <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={currentUser.avatarUrl} className="grayscale brightness-75 group-hover/form:grayscale-0 group-hover/form:brightness-100 transition-all" />
            <AvatarFallback className="bg-noir-border text-white text-xs">{currentUser.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
            <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your comment here"
                disabled={isSubmitting}
                className="w-full bg-transparent border-b border-noir-border text-white placeholder:text-muted-text text-sm py-2 pr-10 focus:outline-none focus:border-electric-lime transition-colors disabled:opacity-50"
            />
            <button 
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-electric-lime disabled:text-muted-text transition-colors"
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            </div>
        </form>
      ) : (
          <div className="text-sm text-muted-text text-center py-4 bg-noir-terminal/30 rounded-lg">
              Log in to post comments.
          </div>
      )}

      {/* Comment List */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage 
                src={comment.author.avatarUrl} 
                alt={comment.author.username} 
                className="grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all"
              />
              <AvatarFallback className="bg-noir-border text-white text-xs">
                {comment.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{comment.author.username}</span>
                <span className="text-xs text-muted-text">• {comment.timestamp}</span>
              </div>
              <p className="text-sm text-white/80 mt-1 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
