export type AppUser = {
  uid: string;
  email: string | null;
  name: string;
  photo: string | null;
};

export type LiveLocation = {
  uid: string;
  name: string;
  photo: string | null;
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  battery: number | null;
  charging: boolean | null;
  isSharing: boolean;
  timestamp: number;
};

export type HistoryPoint = {
  lat: number;
  lng: number;
  accuracy: number;
  speed: number | null;
  timestamp: number;
};

export type FamilyGroup = {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: number;
  members: Record<string, GroupMember>;
};

export type GroupMember = {
  uid: string;
  name: string;
  photo: string | null;
  joinedAt: number;
  role: 'owner' | 'member';
};

export type SafePlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  emoji: string;
  createdAt: number;
};

export type SosAlert = {
  id: string;
  uid: string;
  name: string;
  photo: string | null;
  lat: number;
  lng: number;
  message: string;
  timestamp: number;
  resolved: boolean;
};

export type GeofenceEventType = 'enter' | 'exit';

export type GeofenceEvent = {
  uid: string;
  name: string;
  placeId: string;
  placeName: string;
  type: GeofenceEventType;
  timestamp: number;
};
