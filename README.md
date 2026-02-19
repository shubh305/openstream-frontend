# OpenStream // PORTAL

**Status:** `OPERATIONAL` // **Tier:** `UI_SPOKE` // **Platform:** `OCTANEBREW_HUB`

**OpenStream** is a high-fidelity video portal built for the **Noir Aesthetic** - an immersive, cinema-grade interface designed for content creators and viewers options. Engineered for speed and responsiveness, it features a robust **Smart Upload Wizard**, sub-second latency playback, and a persistent, high-frequency chat engine. As a UI Spoke, it integrates seamlessly with the OctaneBrew Hub while maintaining a distinct, performance-optimized identity.

## Quick Start

1. **Setup**:
   ```bash
   npm install
   ```
2. **Launch**:
   ```bash
   npm run dev
   ```
3. **Access**: `http://localhost:3000` (ensure `openstream-backend` is running).

### Prerequisites
- **Node.js**: v22 or later
- **Backend**: `openstream-backend` running on port 3001
- **Gateway**: OctaneBrew Nginx Gateway for asset routing

## Architecture
OpenStream Frontend implements the following core philosophies:
- **Vertical Feature Slices**: Modular architecture separating Auth, Chat, Player, and Upload domains.
- **Hybrid State Management**: Zeta for local high-frequency state, Context for global auth.
- **Noir Design System**: Strict adherence to the platform's dark-mode industrial aesthetic.

## Technical Documentation Suite

The authoritative documentation for the frontend platform is available in the `docs` directory:

| Document | Description |
| :--- | :--- |
| [**Architecture**](./docs/architecture.md) | Component hierarchy, state strategies, and hooks. |
| [**Frontend Deep Dive**](./docs/frontend.md) | Tech stack, performance optimizations.
| [**Operations**](./docs/operations.md) | Build strategies, Docker deployment, and env vars. |
| [**User Flows**](./docs/flows.md) | Visual sequence diagrams for Upload, Playback, and Chat. |

---

## Primary Capabilities
- **Smart Upload Wizard**: Client-side validation, TUS integration, and real-time processing feedback.
- **Instant Playback**: Auto-switching HLS player that adapts to "Fast Lane" availability.
- **Real-Time Chat**: Persistent WebSocket connection for high-frequency engagement.
- **Dashboard**: Command center for managing VOD assets and stream keys.

---

## Technology Stack
- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Noir Variables
- **Player**: [Video.js](https://videojs.com/)
- **Uploads**: [tus-js-client](https://github.com/tus/tus-js-client)
- **Real-time**: [Socket.IO Client](https://socket.io/)
- **Icons**: [Lucide React](https://lucide.dev)
