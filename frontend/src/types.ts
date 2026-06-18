// TypeScript types mirroring the backend API response shapes.

export type AccessPoint = {
  provider_id: string;
  name: string;
  status: string | null;
  model: string | null;
  mac_address: string | null;
};

export type Venue = {
  provider_id: string;
  name: string;
  address: string | null;
  city: string | null;
  access_points: AccessPoint[];
};

export type VenueRef = {
  provider_id: string;
  name: string;
  city: string | null;
};

export type Session = {
  provider_id: string;
  venue: VenueRef | null;
  access_point: AccessPoint | null;
  client_mac: string | null;
  username: string | null;
  device_type: string | null;
  started_at: string | null;
  ended_at: string | null;
  bytes_in: number;
  bytes_out: number;
};

export type SyncStatus = {
  status: string | null;
  last_synced_at: string | null;
  records_synced: number | null;
};

export type SyncResult = {
  status: string;
  records_synced: number;
  synced_at: string | null;
  error: string | null;
};

export type InsightFlag = {
  level: string;
  message: string;
};

export type Insights = {
  total_venues: number;
  total_access_points: number;
  online_access_points: number;
  offline_access_points: number;
  total_sessions: number;
  active_sessions: number;
  busiest_venue: string | null;
  total_bytes: number;
  flags: InsightFlag[];
};
