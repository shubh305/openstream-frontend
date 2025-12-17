"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

export default function CustomizationPage() {
  const [activeTab, setActiveTab] = useState("Branding");

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Channel customization</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-noir-border">
        {["Layout", "Branding", "Basic info"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "border-electric-lime text-electric-lime"
                : "border-transparent text-muted-text hover:text-foreground hover:border-muted-text/30"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-12">
        {activeTab === "Branding" && (
          <>
            {/* Banner Image */}
            <div className="space-y-4">
               <div>
                  <h3 className="text-base font-medium text-foreground">Banner image</h3>
                  <p className="text-sm text-muted-text max-w-2xl">
                    This image will appear across the top of your channel. For the best results on all devices, use an image that&apos;s at least 2048 x 1152 pixels and 6MB or less.
                  </p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-noir-terminal border border-noir-border rounded-lg">
                  <div className="w-64 aspect-video bg-noir-bg border border-noir-border flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-signal-red/20 border-t border-signal-red/50" />
                      <div className="relative z-10 w-32 h-20 border-2 border-dashed border-muted-text rounded flex items-center justify-center">
                          <span className="text-[10px] text-muted-text uppercase">Preview</span>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="text-xs text-muted-text font-mono uppercase tracking-widest">Current_Asset::Empty</div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="text-electric-lime border-electric-lime/20 hover:bg-electric-lime/10">Upload</Button>
                      </div>
                  </div>
               </div>
            </div>

            {/* Profile Picture */}
            <div className="space-y-4 pt-8 border-t border-noir-border">
               <div>
                  <h3 className="text-base font-medium text-foreground">Picture</h3>
                  <p className="text-sm text-muted-text max-w-2xl">
                    Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments.
                  </p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-6 items-start p-6 bg-noir-terminal border border-noir-border rounded-lg">
                  <div className="w-32 h-32 rounded-full bg-noir-bg border border-noir-border flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-4xl font-bold text-electric-lime italic">P1</span>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="text-xs text-muted-text font-mono uppercase tracking-widest">It&apos;s recommended to use a picture that&apos;s at least 98 x 98 pixels.</div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="text-foreground border-noir-border hover:bg-white hover:text-black">Change</Button>
                        <Button variant="ghost" className="text-muted-text hover:text-signal-red">Remove</Button>
                      </div>
                  </div>
               </div>
            </div>
          </>
        )}

        {activeTab === "Basic info" && (
           <div className="space-y-8 max-w-3xl">
              {/* Name */}
              <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Name</label>
                 <p className="text-xs text-muted-text">Choose a channel name that represents you and your content.</p>
                 <div className="relative">
                   <Input 
                      defaultValue="John Doe" 
                      className="bg-noir-bg border-noir-border focus:border-electric-lime h-12 text-foreground font-mono"
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-text">13/50</div>
                 </div>
              </div>

              {/* Handle */}
              <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Handle</label>
                 <p className="text-xs text-muted-text">Choose your unique handle by adding letters and numbers.</p>
                 <div className="relative">
                   <Input 
                      defaultValue="@johndoe" 
                      className="bg-noir-bg border-noir-border focus:border-electric-lime h-12 text-foreground font-mono"
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-text">10/30</div>
                 </div>
                 <div className="text-[10px] text-muted-text font-mono">https://openstream.dev/@johndoe</div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Description</label>
                 <textarea 
                    className="w-full min-h-[150px] bg-noir-bg border border-noir-border rounded-md px-3 py-3 text-sm text-foreground focus:outline-none focus:border-electric-lime resize-none"
                    placeholder="Tell viewers about your channel..."
                 />
                 <div className="text-right text-xs text-muted-text">0/1000</div>
              </div>

               {/* Channel URL */}
               <div className="space-y-2 pt-4 border-t border-noir-border">
                   <label className="text-sm font-medium text-foreground">Channel URL</label>
                   <div className="flex items-center gap-2 bg-noir-terminal border border-noir-border p-3 rounded-md">
                       <div className="flex-1 text-sm text-muted-text font-mono truncate">https://openstream.dev/channel/UC4rgYmM7...</div>
                       <Button size="icon" variant="ghost" className="h-6 w-6 text-electric-lime"><Copy className="w-4 h-4" /></Button>
                   </div>
               </div>
           </div>
        )}

        {/* Action Bar (Fixed Bottom) */}
        <div className="fixed bottom-0 left-64 right-0 p-4 bg-noir-terminal border-t border-noir-border flex justify-end gap-3 z-20">
             <Button variant="ghost" className="text-muted-text hover:text-foreground">Cancel</Button>
             <Button className="bg-foreground text-background hover:bg-electric-lime hover:text-black">Publish</Button>
        </div>
      </div>
    </div>
  );
}
