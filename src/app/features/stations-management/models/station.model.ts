import { Manager } from "./manager.model";
import { Pump } from "./pump.model";

export interface Station {
  id: string | null;
  name: string;
  address: string;
  ward: string;
  lga: string;
  state: string;
  // Operational details
  longitude: number; // Changed from 0 to number
  latitude: number; // Changed from 0 to number
  pricePerLiter: number; // Changed from 0 to number
  // Fields needed for the component's stats/lists
  manager: Manager;
  pumps: Pump[];
  fuelLevelPercentage: number; // e.g., 0 to 100
  lastInspectionDate: string; // ISO Date string
  lastMaintenanceDate: string; // ISO Date string
  lastUpdated: Date;
}