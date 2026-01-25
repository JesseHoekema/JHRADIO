const AZURA_BASE_URL = "https://azura.jessehoekema.com";
const AZURA_STATION = "jhradio";

export const config = {
  AZURA_BASE_URL,
  AZURA_STATION,
  AZURA_MP3: `${AZURA_BASE_URL}/listen/${AZURA_STATION}/radio.mp3`
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
export async function fetchScheduleWeek(start: string, end: string): Promise<any> {
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
    window.open(`https://www.last.fm/music/${encodedArtist}/_/${encodedTitle}`, "_blank");
  }
}