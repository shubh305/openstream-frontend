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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-10">
          {/* Visual Identity Section */}
          <StudioCard title="Visual Assets" padding="none" rounded="large">
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleFileChange("banner")} />
            <div onClick={handleBannerClick} className="h-32 md:h-48 bg-noir-terminal relative cursor-pointer group/banner transition-all overflow-hidden">
              {channel?.bannerUrl ? (
                <Image src={channel.bannerUrl} alt="Channel Banner" fill className="object-cover transition-transform duration-1000 group-hover/banner:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-noir-terminal to-noir-bg flex items-center justify-center">
                  <LayoutTemplate className="w-8 h-8 text-white/5" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-all bg-black/40 backdrop-blur-md">
                <div className="bg-white text-black p-3 rounded-full shadow-2xl transform scale-90 group-hover/banner:scale-100 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-10 relative">
              <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleFileChange("avatar")} />
              <div className="relative -mt-12 md:-mt-16 mb-6 inline-block">
                <div
                  onClick={handleAvatarClick}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] md:rounded-[32px] bg-noir-terminal border-4 md:border-8 border-noir-deep overflow-hidden shadow-2xl relative group/avatar cursor-pointer transition-all hover:scale-105"
                >
                  {channel?.avatarUrl ? (
                    <Image src={channel.avatarUrl} alt={name} width={128} height={128} className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-electric-lime font-black text-2xl md:text-5xl">{(name[0] || "U").toUpperCase()}</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Screen Name</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Creative Name"
                      className="bg-white/5 border-white/5 focus:border-white/20 h-16 text-xl font-black uppercase tracking-tight px-6 rounded-2xl transition-all"
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
                        className="bg-white/5 border-white/5 focus:border-white/20 h-16 text-xl font-black tracking-tight pl-12 pr-6 rounded-2xl transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-text uppercase tracking-widest ml-1">Mission / About</label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Transmission details..."
                    className="bg-white/5 border-white/5 focus:border-white/20 min-h-[160px] text-base p-6 rounded-3xl resize-none leading-relaxed transition-all font-medium"
                  />
                  <div className="text-[9px] font-mono text-muted-text uppercase tracking-widest text-right px-2">{description.length} / 1000 SYMBOLS</div>
                </div>
              </div>
            </div>
          </StudioCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-10">
          <StudioCard title="Broadcast URL" padding="lg" rounded="large" className="shadow-2xl">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-electric-lime/10 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-electric-lime" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-muted-text uppercase tracking-widest mb-1">Public Access Link</div>
                <div className="text-sm font-bold text-white truncate font-mono">{origin ? `${origin.replace(/^https?:\/\//, "")}/@${handle || "..."}` : `openstream.dev/@${handle || "..."}`}</div>
              </div>
            </div>
            <p className="text-xs text-muted-text leading-relaxed font-medium">
              {" "}
              This is your unique broadcast identifier. High-fidelity streams and community interactions will originate from this terminal point.{" "}
            </p>
          </StudioCard>

          <StudioCard title="Live Preview Stat" padding="xl" rounded="large" className="relative overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-lime/5 blur-3xl -mr-16 -mt-16" />
              <div className="w-24 h-24 rounded-[32px] bg-noir-terminal border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                {channel?.avatarUrl ? (
                  <Image src={channel.avatarUrl} alt="" width={96} height={96} className="object-cover" />
                ) : (
                  <span className="text-electric-lime font-black text-3xl">{name[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{name || "Unnamed"}</h3>
                <p className="text-[10px] font-black text-muted-text uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-lime animate-pulse" />
                  Established
                </p>
              </div>
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
