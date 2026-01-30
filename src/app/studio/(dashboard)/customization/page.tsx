"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Save, LayoutTemplate } from "lucide-react";
import { getMyChannel, updateChannel } from "@/actions/channel";
import { uploadChannelImage } from "@/actions/user";
import { toast } from "sonner";
import { Channel } from "@/types/api";

export default function CustomizationPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    async function fetchChannel() {
      try {
        const data = await getMyChannel();
        if (data) {
          setChannel(data);
          setName(data.name);
          setHandle(data.handle);
          setDescription(data.description || "");
        }
      } catch (error) {
        console.error("Failed to fetch channel:", error);
        toast.error("Failed to load channel information");
      } finally {
        setIsLoading(false);
      }
    }
    fetchChannel();
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await updateChannel({
        name,
        handle: handle.replace("@", ""),
        description,
      });

      if (result.success) {
        toast.success("Changes published successfully");
        if (channel) {
          setChannel({ ...channel, name, handle: handle.replace("@", ""), description });
        }
      } else {
        toast.error(result.error || "Failed to update channel");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleFileChange = (type: "banner" | "avatar") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const promise = uploadChannelImage(formData, type);

    toast.promise(promise, {
      loading: `Uploading ${type}...`,
      success: data => {
        if (data.error) throw new Error(data.error);

        if (channel) {
          const updatedChannel = { ...channel };
          if (type === "avatar") updatedChannel.avatarUrl = data.url;
          if (type === "banner") updatedChannel.bannerUrl = data.url;
          setChannel(updatedChannel);
        }
        return `${type === "banner" ? "Banner" : "Avatar"} updated successfully`;
      },
      error: err => `Failed to upload: ${err.message}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-text" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-12 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LayoutTemplate className="w-6 h-6 text-electric-lime" />
            Channel Identity
          </h1>
          <p className="text-sm text-muted-text mt-1">Customize how viewers categorize and discover your content.</p>
        </div>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="rounded-full bg-electric-lime text-black hover:bg-electric-lime/90 font-bold px-8 shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
        >
          {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isPublishing ? "Publishing..." : "Publish Changes"}
        </Button>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* ROW 1: Visual Identity */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-muted-text uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-lime" />
            Visual Identity
          </h2>
          <div className="bg-noir-terminal rounded-3xl overflow-hidden border border-white/5 shadow-2xl group relative">
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleFileChange("banner")} />
            <div onClick={handleBannerClick} className="h-32 md:h-46 bg-gradient-to-br from-neutral-900 to-black relative cursor-pointer group/banner transition-all hover:opacity-95 overflow-hidden">
              {channel?.bannerUrl && <Image src={channel.bannerUrl} alt="Channel Banner" fill className="object-cover transition-transform duration-700 group-hover/banner:scale-105" />}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border border-white/20 px-6 py-3 rounded-full bg-black/50 hover:bg-white/10 transition-colors">
                  <Upload className="w-4 h-4" /> Change Banner
                </span>
              </div>
            </div>

            <div className="px-8 pb-8 relative">
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleFileChange("avatar")} />
              <div className="relative -mt-16 mb-6 inline-block">
                <div
                  onClick={handleAvatarClick}
                  className="w-32 h-32 rounded-3xl bg-black border-4 border-noir-terminal overflow-hidden shadow-2xl relative group/avatar cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  {channel?.avatarUrl ? (
                    <Image src={channel.avatarUrl} alt={name} width={128} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-electric-lime font-bold text-4xl">{name[0]?.toUpperCase()}</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-white leading-tight tracking-tight">{name || "Channel Name"}</h2>
                  <p className="text-base text-muted-text font-medium mt-1">@{handle || "handle"}</p>
                </div>
                <div className="flex gap-2 text-xs font-mono text-muted-text bg-white/5 py-2 px-4 rounded-lg border border-white/5">
                  <span className="text-electric-lime">●</span> Live Preview
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROW 2: Basic Info */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-muted-text uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-lime" />
            Basic Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-text ml-1">Channel Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. The Coding Den"
                className="bg-noir-terminal border-white/10 focus:border-electric-lime h-14 text-lg font-medium px-4 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-text ml-1">Handle</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text font-medium select-none">@</span>
                <Input
                  value={handle}
                  onChange={e => setHandle(e.target.value.replace("@", ""))}
                  placeholder="coding_den"
                  className="bg-noir-terminal border-white/10 focus:border-electric-lime h-12 text-lg font-medium pl-9 pr-4 rounded-xl font-mono transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-text text-right font-mono mt-1.5">{origin ? `${origin}/@${handle}` : `openstream.dev/@${handle}`}</p>
            </div>
          </div>
        </section>

        {/* ROW 3: About */}
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-muted-text uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-lime" />
            About
          </h2>
          <div className="space-y-2">
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Welcome to my channel! Here I stream..."
              className="bg-noir-terminal border-white/10 focus:border-electric-lime min-h-[200px] text-base p-6 rounded-2xl resize-none leading-relaxed transition-all"
            />
            <div className="text-[10px] text-muted-text uppercase tracking-widest text-right px-1">{description.length} / 1000</div>
          </div>
        </section>
      </div>
    </div>
  );
}
