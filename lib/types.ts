export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
};

export type Session = {
  id: string;
  group_id: string;
  host_id: string;
  date: string;
  location: string | null;
  notes: string | null;
  status: "upcoming" | "completed" | "cancelled";
  created_at: string;
};

export type RSVP = {
  id: string;
  session_id: string;
  user_id: string;
  response: "yes" | "no" | "maybe";
  updated_at: string;
};

export type Result = {
  id: string;
  session_id: string;
  winner_id: string;
  notes: string | null;
  recorded_by: string;
  created_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  wins: number;
  sessions_played: number;
  last_win_date: string | null;
};

// Joined types used in queries
export type SessionWithHost = Session & {
  profiles: Pick<Profile, "name" | "avatar_url">;
  rsvps: RSVP[];
};
