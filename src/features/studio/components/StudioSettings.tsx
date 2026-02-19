"use client";

import { Input } from "@/components/ui/input";
import { Globe, Lock, Users } from "lucide-react";

export type Visibility = "public" | "unlisted" | "private";

export interface StreamSettingsData {
  title: string;
  description: string;
  category: string;
  visibility: Visibility;
  thumbnailUrl?: string;
}

interface StudioSettingsProps {
  settings: StreamSettingsData;
  onChange: (settings: StreamSettingsData) => void;
  disabled?: boolean;
  className?: string;
}

const CATEGORIES = [
  "Gaming",
  "Music",
  "Talk & Podcasts",
  "Sports",
  "Creative",
  "Education",
  "Technology",
  "Other",
];

export function StudioSettings({ settings, onChange, disabled, className }: StudioSettingsProps) {
  const updateField = (field: keyof StreamSettingsData, value: string) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className={`bg-noir-terminal border border-noir-border rounded-xl p-4 sm:p-6 space-y-6 ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}>
      {/* Title */}
      <div>
        <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">
          Stream Title <span className="text-signal-red">*</span>
        </label>
        <Input
          value={settings.title}
          onChange={e => updateField("title", e.target.value)}
          placeholder="Enter a title for your stream..."
          className="bg-noir-bg border-noir-border focus:border-electric-lime h-11 sm:h-12 text-sm rounded-lg"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">Stream Description</label>
        <textarea
          value={settings.description}
          onChange={e => updateField("description", e.target.value)}
          placeholder="Tell viewers about your stream..."
          rows={4}
          className="w-full bg-noir-bg border border-noir-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-text/50 focus:border-electric-lime focus:outline-none resize-none transition-colors"
        />
        <p className="text-[10px] text-muted-text mt-1.5 flex justify-end">{settings.description.length}/500</p>
      </div>

      {/* Visibility */}
      <div>
        <label className="text-xs text-muted-text uppercase tracking-wide mb-3 block">Visibility</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "public", label: "Public", icon: Globe, desc: "Everyone can watch" },
            { id: "unlisted", label: "Unlisted", icon: Users, desc: "Only with link" },
            { id: "private", label: "Private", icon: Lock, desc: "Only you" },
          ].map(option => (
            <button
              key={option.id}
              onClick={() => updateField("visibility", option.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                settings.visibility === option.id ? "border-electric-lime bg-electric-lime/5" : "border-noir-border hover:border-muted-text"
              }`}
            >
              <option.icon className={`w-5 h-5 mb-2 ${settings.visibility === option.id ? "text-electric-lime" : "text-muted-text"}`} />
              <span className={`text-sm font-medium block ${settings.visibility === option.id ? "text-foreground" : "text-muted-text"}`}>{option.label}</span>
              <span className="text-xs text-muted-text">{option.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-muted-text uppercase tracking-wide mb-2 block">Category</label>
        <select
          value={settings.category}
          onChange={e => updateField("category", e.target.value)}
          className="w-full bg-noir-bg border border-noir-border text-foreground rounded-lg h-12 px-4 text-sm focus:border-electric-lime focus:outline-none transition-colors"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
