import { Manager } from "./manager.model";
import { Pump } from "./pump.model";
import { Dispenser } from "../../dispensers-management/models/dispenser.model";

export interface Station {
  id: string;
  name: string;
  address: string;
  ward: string;
  lga: string;
  state: string;
  longitude: number;
  latitude: number;

  petrolVolume: number;
  dieselVolume: number;
  petrolPricePerLitre: number;
  dieselPricePerLitre: number;

  status: 'active' | 'inactive';
  createdAt: number;

  // Fields needed for the component's stats/lists
  manager: Manager;
  pumps: Pump[];
  dispensers: Dispenser[];
  sales: any[];

  fuelLevelPercentage?: number;
  lastInspectionDate?: string;
  lastMaintenanceDate?: string;
  lastUpdated: Date;
}