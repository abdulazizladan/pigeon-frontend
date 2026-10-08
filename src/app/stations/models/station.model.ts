export type StationStatus = 'active' | 'maintenance' | 'inactive';

export const STATION_STATUSES: StationStatus[] = ['active', 'maintenance', 'inactive'];

/** The 36 states of Nigeria plus the Federal Capital Territory. Mirrors the backend list. */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export interface Station {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  lga: string | null;
  state: string | null;
  status: StationStatus;
  managerId: string | null;
  managerUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationPayload {
  name: string;
  description?: string;
  address: string;
  lga: string;
  state: string;
  status: StationStatus;
  managerId?: string;
}

export interface UpdateStationPayload {
  name?: string;
  description?: string | null;
  address?: string;
  lga?: string;
  state?: string;
  status?: StationStatus;
  managerId?: string | null;
}

export interface StationStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  managers: {
    total: number;
    assigned: number;
    unassigned: number;
  };
}

export function stationStatusLabel(status: StationStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'maintenance': return 'Under maintenance';
    case 'inactive': return 'Inactive';
  }
}

export function stationStatusDescription(status: StationStatus): string {
  switch (status) {
    case 'active': return 'Open and trading';
    case 'maintenance': return 'Temporarily closed for works';
    case 'inactive': return 'Not operating';
  }
}

/** "Address, LGA, State" with empty parts skipped. */
export function stationLocation(station: Pick<Station, 'address' | 'lga' | 'state'>): string {
  return [station.address, station.lga, station.state].filter(Boolean).join(', ');
}
