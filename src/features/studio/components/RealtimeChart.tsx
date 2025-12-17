"use client";

import { RealtimeStats } from "@/actions/analytics";

interface RealtimeChartProps {
    initialData?: RealtimeStats | null;
}

export function RealtimeChart({ initialData }: RealtimeChartProps) {
    const views48h = initialData?.views48Hours || [];
    
    const renderBars = () => {
        if (views48h.length > 0) {
            const max = Math.max(...views48h.map(d => d.views), 10);
            return views48h.map((d, i) => (
                <div 
                    key={i} 
                    className="flex-1 bg-electric-lime hover:opacity-100 transition-opacity" 
                    style={{ 
                        height: `${(d.views / max) * 100}%`,
                        opacity: 0.5 + ((i % 5) / 10)
                    }} 
                    title={`${d.views} views`}
                />
            ));
        }
        
        return Array.from({ length: 48 }).map((_, i) => (
             <div 
                key={i} 
                className="flex-1 bg-electric-lime" 
                style={{ height: `${20 + (Math.random() * 60)}%`, opacity: 0.3 }} 
             />
        ));
    };

    return (
        <div className="bg-noir-terminal border border-noir-border rounded-xl p-6 h-96 flex flex-col items-center justify-center relative">
            <div className="absolute top-6 left-6 text-sm text-foreground font-medium">Realtime activity</div>
            <div className="flex items-end gap-1 h-32 w-full max-w-3xl opacity-80">
                {renderBars()}
            </div>
            <p className="text-muted-text text-sm mt-4 animate-pulse">
                {initialData ? "Live Updates Active" : "Waiting for data..."}
            </p>
        </div>
    );
}
