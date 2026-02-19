# Frontend Technical Reference

## Technology Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router).
*   **Language**: TypeScript 5.x.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Variables.
*   **UI Library**: [Shadcn/UI](https://ui.shadcn.com/) (Radix Primitives).
*   **Icons**: [Lucide React](https://lucide.dev/).
*   **Video**: [Video.js](https://videojs.com/) (HLS Support).
*   **Uploads**: [tus-js-client](https://github.com/tus/tus-js-client).

---

## Performance Considerations

### WebSocket Efficiency
To prevent socket overload:
*   We use a **Single Socket Connection** pattern where possible, multiplexing events rather than opening multiple connections.
*   The `useVideoStatus` hook aggressively cleans up listeners when components unmount.

### Bundle Analysis
The largest dependencies are `video.js` and `ffmpeg.wasm` (if used someday). These are strictly lazy-loaded only when the user enters a playback or specialized editing route.

---

## Directory Structure

```text
.
├── app/               # Next.js App Router (Layouts & Pages)
│   ├── (auth)/        # Authentication routes
│   ├── dashboard/     # Streamer command center
│   ├── watch/         # Video playback pages
│   └── globals.css    # Noir base styles
├── components/        # Reusable UI (VideoPlayer, Chat, etc.)
├── hooks/             # Custom React Hooks (useSocket, useAuth)
├── public/           # Static assets & OpenGraph images
└── tailwind.config.ts # Theme & Noir tokens
```
