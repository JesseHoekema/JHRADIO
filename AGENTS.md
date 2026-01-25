# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

JHRADIO is a SvelteKit 5 web application that provides a live radio player interface with real-time now-playing data and schedule viewing. It integrates with an AzuraCast radio server via REST API and WebSocket connections.

## Key Commands

### Development
- `pnpm install` - Install dependencies (project uses pnpm as package manager)
- `pnpm run dev` - Start development server
- `pnpm run dev -- --open` - Start dev server and open in browser

### Building & Preview
- `pnpm run build` - Create production build
- `pnpm run preview` - Preview production build locally

### Type Checking & Validation
- `pnpm run check` - Run Svelte type checking
- `pnpm run check:watch` - Run type checking in watch mode

## Architecture

### Tech Stack
- **Framework**: SvelteKit 2.49+ with Svelte 5 (uses runes syntax: `$state`, `$derived`, `$props`)
- **Styling**: Tailwind CSS 4.1+ (imported via `@tailwindcss/vite`)
- **Language**: TypeScript with strict mode enabled
- **Build Tool**: Vite 7+
- **Package Manager**: pnpm

### Real-time Data Flow

The application maintains a persistent WebSocket connection to AzuraCast:

1. **Initial Load**: Server-side load functions (`+page.server.ts`) fetch initial data via REST API
2. **Live Updates**: Client establishes WebSocket connection to `wss://azura.jessehoekema.com/api/live/nowplaying/websocket`
3. **WebSocket Protocol**: Subscribes to `station:jhradio` channel with recovery enabled
4. **Data Handling**: 
   - Messages contain either `connect` (initial) or `pub` (updates) events
   - Both contain `np` (now playing) data in nested structure
   - Song changes detected by comparing `now_playing.song.id`

### State Management

**Layout-level State** (`+layout.svelte`):
- Manages WebSocket connection shared across routes
- Provides background blur effect based on current album art
- Initializes from server data, then receives live updates

**Page-level State** (`+page.svelte`):
- Maintains local progress tracking with client-side timer
- Tracks `songStartTime`, `initialElapsed`, and `currentTime` for smooth progress bar
- Resets timing when song ID changes

### API Integration (`src/lib/azura.ts`)

Configuration:
```typescript
AZURA_BASE_URL = "https://azura.jessehoekema.com"
AZURA_STATION = "jhradio"
```

Key functions:
- `fetchNowPlaying()` - GET `/api/nowplaying/${STATION_NAME}`
- `fetchScheduleWeek(start, end)` - GET `/api/station/${STATION_NAME}/schedule?start=...&end=...`

### Route Structure

- `/` - Main player view with now-playing display, progress tracking, and audio controls
- `/schedule` - Week-view calendar showing scheduled programming (Mon-Sun grid)

### Svelte 5 Patterns

This codebase uses **Svelte 5 runes** extensively:
- `$state()` for reactive state
- `$derived()` for computed values
- `$props()` for component props
- Reactive statements using `$:` syntax are still present in older components

When adding new components or modifying existing ones, maintain consistency with Svelte 5 patterns.

### Styling Approach

- Global styles via Tailwind CSS imported in `src/routes/layout.css`
- Component-scoped styles in `<style>` blocks for custom animations and layouts
- Uses Tailwind utilities for spacing, colors, and responsive design
- Custom CSS for complex effects (blur backgrounds, progress bars, transitions)

## Important Patterns

### Time Tracking
The main player uses a hybrid approach for song progress:
- Server provides `elapsed` time at snapshot
- Client calculates `songStartTime = Date.now()` when song changes
- Local timer updates `currentTime = initialElapsed + secondsSinceStart`
- Progress bar uses `(currentTime / duration) * 100`

### WebSocket Reconnection
Both layout and page components implement auto-reconnect:
```javascript
ws.onclose = () => {
  setTimeout(connectWebSocket, 2000); // Reconnect after 2s
};
```

### Album Art URL Handling
Album art URLs from AzuraCast may be relative paths:
```javascript
artUrl = nowPlaying.now_playing.song.art.startsWith("/")
  ? `https://azura.jessehoekema.com${nowPlaying.now_playing.song.art}`
  : nowPlaying.now_playing.song.art
```

### Schedule Calendar Layout
The schedule page uses CSS Grid with:
- Fixed time gutter (72px) + 7 equal day columns
- Absolute positioning for events based on `top` (minutes * MINUTE_PX) and `height`
- Mobile responsive: shows only current day on screens < 640px

## File Organization

- `src/lib/azura.ts` - AzuraCast API client and type definitions
- `src/routes/+layout.svelte` - Root layout with shared WebSocket and background
- `src/routes/+page.svelte` - Main player UI
- `src/routes/+page.server.ts` - Server-side data loading
- `src/routes/schedule/+page.svelte` - Schedule calendar view
- `src/routes/schedule/+page.server.ts` - Schedule server data loading

## Dependencies Note

The project includes both `svelte-fullcalendar` and `fullcalendar-svelte` in dependencies, but the schedule view is implemented with custom CSS Grid layout rather than using these libraries.
