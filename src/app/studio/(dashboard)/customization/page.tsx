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
import { StudioCard } from "@/features/studio/components/StudioCard";

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
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-white/5 sticky top-0 bg-background/80 backdrop-blur-3xl z-40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-electric-lime">Identity</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">Channel Brand</h1>
          <p className="text-muted-text font-medium text-xs md:text-sm">Manage your digital presence and signature.</p>
        </div>
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="h-12 px-8 rounded-xl bg-electric-lime text-black font-black text-[10px] uppercase tracking-[0.15em] hover:bg-white transition-all shadow-xl shadow-electric-lime/10 group"
        >
          {isPublishing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform" />}
          {isPublishing ? "Syncing..." : "Publish"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Branding Assets & Identity */}
        <div className="xl:col-span-8 space-y-8">
          {/* Visual Branding Card */}
          <StudioCard title="Visual Branding" padding="none" rounded="large" className="overflow-hidden">
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleFileChange("banner")} />
            <div onClick={handleBannerClick} className="h-40 md:h-56 bg-noir-terminal relative cursor-pointer group/banner transition-all overflow-hidden">
              {channel?.bannerUrl ? (
                <Image src={channel.bannerUrl} alt="Channel Banner" fill className="object-cover transition-transform duration-1000 group-hover/banner:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-noir-terminal to-noir-bg flex items-center justify-center">
                  <LayoutTemplate className="w-10 h-10 text-white/5" />
                  <span className="absolute bottom-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Click to upload banner</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                <div className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transform translate-y-2 group-hover/banner:translate-y-0 transition-all flex items-center gap-2">
                  <Upload className="w-3 h-3" />
                  Update Banner
                </div>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleFileChange("avatar")} />
              <div className="relative -mt-16 md:-mt-20">
                <div
                  onClick={handleAvatarClick}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-noir-terminal border-[8px] border-noir-bg overflow-hidden shadow-2xl relative group/avatar cursor-pointer transition-all hover:scale-105"
                >
                  {channel?.avatarUrl ? (
                    <Image src={channel.avatarUrl} alt={name} width={160} height={160} className="object-cover w-full h-full grayscale group-hover/avatar:grayscale-0 transition-all duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-electric-lime font-black text-4xl md:text-6xl">{(name[0] || "U").toUpperCase()}</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all backdrop-blur-sm">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="pb-4 space-y-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">{name || "Channel Name"}</h2>
                <p className="text-muted-text font-mono text-[10px] uppercase tracking-widest">@{handle || "handle"}</p>
              </div>
            </div>
          </StudioCard>

          {/* Basic Identity Card */}
          <StudioCard title="Channel Details" padding="xl" rounded="large">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Screen Name</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Transmission Identity"
                    className="bg-white/5 border-white/5 focus:border-white/20 h-14 text-lg font-black uppercase tracking-tight px-6 rounded-2xl transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Digital Handle</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black select-none">@</span>
                    <Input
                      value={handle}
                      onChange={e => setHandle(e.target.value.replace("@", ""))}
                      placeholder="handle"
                      className="bg-white/5 border-white/5 focus:border-white/20 h-14 text-lg font-black tracking-tight pl-12 pr-6 rounded-2xl transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest">Mission / Bio</label>
                  <div className="text-[9px] font-mono text-muted-text uppercase tracking-widest">{description.length} / 1000</div>
                </div>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your frequency..."
                  className="bg-white/5 border-white/5 focus:border-white/20 min-h-[160px] text-base p-6 rounded-3xl resize-none leading-relaxed transition-all font-medium"
                />
              </div>
            </div>
          </StudioCard>
        </div>

        {/* Right Column: Preview & Utils */}
        <div className="xl:col-span-4 space-y-8 sticky top-[120px]">
          <StudioCard title="Public Broadcast" padding="lg" rounded="large" className="shadow-2xl border-white/5 bg-gradient-to-br from-noir-terminal/50 to-transparent">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 group cursor-pointer hover:border-electric-lime/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-electric-lime/10 flex items-center justify-center group-hover:bg-electric-lime/20 transition-all">
                  <LayoutTemplate className="w-5 h-5 text-electric-lime" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Access URL</div>
                  <div className="text-sm font-bold text-white truncate font-mono tracking-tight">
                    {origin ? `${origin.replace(/^https?:\/\//, "")}/@${handle || "..."}` : `openstream.dev/@${handle || "..."}`}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-text leading-relaxed font-semibold italic opacity-60">
                This is your primary entry point for viewers. High-fidelity streams and telemetry will originate from this node.
              </p>
            </div>
          </StudioCard>

          <StudioCard title="Live Preview" padding="xl" rounded="large" className="relative overflow-hidden border-white/5">
            <div className="flex flex-col items-center text-center space-y-8 py-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 blur-3xl -mr-16 -mt-16" />

              <div className="relative">
                <div className="w-28 h-28 rounded-[36px] bg-noir-terminal border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                  {channel?.avatarUrl ? (
                    <Image src={channel.avatarUrl} alt="" width={112} height={112} className="object-cover" />
                  ) : (
                    <span className="text-electric-lime font-black text-4xl">{name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-noir-bg border-4 border-noir-bg shadow-xl flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-electric-lime animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{name || "Unnamed"}</h3>
                <p className="text-[10px] font-black text-electric-lime uppercase tracking-[0.4em] flex items-center justify-center gap-2">Established</p>
              </div>

              <div className="w-full pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-0.5">Frequency</div>
                  <div className="text-sm font-bold text-white">480p+</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-0.5">Status</div>
                  <div className="text-sm font-bold text-white uppercase tracking-tight">Active</div>
                </div>
              </div>
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
