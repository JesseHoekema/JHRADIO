const AZURA_BASE_URL = "https://azura.jessehoekema.com";
const AZURA_STATION = "jhradio";

export const config = {
  AZURA_BASE_URL,
  AZURA_STATION,
  AZURA_MP3: `${AZURA_BASE_URL}/listen/${AZURA_STATION}/radio.mp3`,
};

export interface NowPlaying {
  station: {
    name: string;
    shortcode: string;
  };
  now_playing: {
    song: {
      id: string;
      text: string;
      artist: string;
      title: string;
      album: string;
      art: string | null;
    };
    elapsed: number;
    duration: number;
    played_at: number;
    playlist: string;
  };
  listeners: {
    total: number;
    unique: number;
  };
  is_online: boolean;
}
export function getProgress(np: NowPlaying): number {
  const { elapsed, duration } = np.now_playing;
  if (!duration) return 0;
  return Math.min(100, (elapsed / duration) * 100);
}

export async function fetchNowPlaying(): Promise<NowPlaying> {
  const url = `${AZURA_BASE_URL}/api/nowplaying/${AZURA_STATION}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }

  return res.json();
}
export async function fetchSchedule(): Promise<any> {
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/schedule`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }

  return res.json();
}
export async function fetchScheduleWeek(
  start: string,
  end: string,
): Promise<any> {
  // AzuraCast schedule API accepts ISO date strings for start and end
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/schedule?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }
  return res.json();
}

export interface SongHistoryEntry {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: {
    id: string;
    art: string | null;
    custom_fields: any[];
    text: string;
    artist: string;
    title: string;
    album: string;
    genre: string;
    isrc: string;
    lyrics: string;
  };
}

export function timeAgo(playedAt: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - playedAt;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export async function fetchRecentlyPlayed(): Promise<SongHistoryEntry[]> {
  const url = `${AZURA_BASE_URL}/api/nowplaying/${AZURA_STATION}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }
  const data = await res.json();
  return data.song_history as SongHistoryEntry[];
}
export const openLastFm = (artist: string, title: string) => {
  if (artist && title) {
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    window.open(
      `https://www.last.fm/music/${encodedArtist}/_/${encodedTitle}`,
      "_blank",
    );
  }
};
export interface RequestableSong {
  request_id: string;
  song: {
    id: string;
    art: string | null;
    text: string;
    artist: string;
    title: string;
    album: string;
  };
}

export const getRequestableSongs = async (): Promise<RequestableSong[]> => {
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/requests`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }
  const data = await res.json();
  return data as RequestableSong[];
};
export const requestSong = async (
  requestId: string,
): Promise<{ success: boolean; message: string }> => {
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/request/${requestId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ request_id: requestId }),
  });
  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }
  const data = await res.json();
  return data as { success: boolean; message: string };
};
export const formatRequestableSongsToDropdown = (songs: RequestableSong[]) => {
  return songs.map((song) => ({
    label: `${song.song.artist} - ${song.song.title}`,
    value: song.request_id,
  }));
};
export const getCurrentListeners = async (): Promise<number> => {
  const data = await fetchNowPlaying();
  return data.listeners.total;
};
export const getCurrentShow = async (): Promise<string> => {
  const data = await fetchNowPlaying();
  return data.now_playing.playlist;
};

export type TodayScheduleItem = {
  from: Date;
  to: Date;
  title: string;
};

export const fetchTodaySchedule = async (): Promise<TodayScheduleItem[]> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const schedule = await fetchScheduleWeek(
    start.toISOString(),
    end.toISOString(),
  );

  return (schedule as any[])
    .map((entry) => {
      let s: Date | null = null;
      let e: Date | null = null;

      if (entry.start_timestamp) {
        s = new Date(entry.start_timestamp * 1000);
      } else if (entry.start) {
        s = new Date(entry.start);
      }

      if (entry.end_timestamp) {
        e = new Date(entry.end_timestamp * 1000);
      } else if (entry.end) {
        e = new Date(entry.end);
      }

      if (!s || !e) return null;

      if (s.getTime() >= end.getTime() || e.getTime() <= start.getTime()) {
        return null;
      }

      const title =
        entry.name ??
        entry.title ??
        entry.show?.name ??
        entry.playlist ??
        "Untitled";

      return {
        from: s,
        to: e,
        title,
      } as TodayScheduleItem;
    })
    .filter((item): item is TodayScheduleItem => Boolean(item));
};

// Listener types and functions
export interface Listener {
  ip: string;
  user_agent: string;
  hash: string;
  mount_is_local: boolean;
  mount_name: string;
  connected_on: number;
  connected_time: number;
  device: {
    client: string;
    is_browser: boolean;
    is_mobile: boolean;
    is_bot: boolean;
    browser_family: string;
    os_family: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
    description: string;
    lat: number;
    lon: number;
  };
}

export interface ListenersResponse {
  listeners: Listener[];
  total: number;
  unique: number;
}

export interface ListenerStats {
  currentListeners: number;
  uniqueListeners: number;
  totalListenTime: number; // in seconds
  listeners: Listener[];
}

export async function fetchListeners(apiKey: string): Promise<ListenerStats> {
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/listeners`;

  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }

  const listeners: Listener[] = await res.json();

  // Calculate total listen time from all connected listeners
  const totalListenTime = listeners.reduce(
    (acc, l) => acc + l.connected_time,
    0,
  );

  // Count unique listeners by hash
  const uniqueHashes = new Set(listeners.map((l) => l.hash));

  return {
    currentListeners: listeners.length,
    uniqueListeners: uniqueHashes.size,
    totalListenTime,
    listeners,
  };
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatListenHours(seconds: number): string {
  const hours = (seconds / 3600).toFixed(1);
  return `${hours}h`;
}

// Song performance reports
export interface SongPerformance {
  song: {
    id: string;
    text: string;
    artist: string;
    title: string;
    album: string;
    art: string | null;
  };
  stat_start: number;
  stat_end: number;
  stat_delta: number;
}

export interface MostPlayedSong {
  song: {
    id: string;
    text: string;
    artist: string;
    title: string;
    album: string;
    art: string | null;
  };
  num_plays: number;
}

export interface BestWorstSongs {
  best: SongPerformance[];
  worst: SongPerformance[];
}

export interface ReportsOverviewResponse {
  bestAndWorst: BestWorstSongs;
  mostPlayed: MostPlayedSong[];
}

export async function fetchBestWorstSongs(
  apiKey: string,
): Promise<ReportsOverviewResponse> {
  const url = `${AZURA_BASE_URL}/api/station/${AZURA_STATION}/reports/overview/best-and-worst`;

  const res = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`AzuraCast API error: ${res.status}`);
  }

  return res.json();
}
