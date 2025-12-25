import { Manager } from "./manager.model";
import { Pump } from "./pump.model";

export interface Station {
  id: string | null;
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

  status: 'active' | 'suspended';

  // Fields needed for the component's stats/lists
  manager: Manager;
  pumps: Pump[];
  sales: any[];

  fuelLevelPercentage?: number;
  lastInspectionDate?: string;
  lastMaintenanceDate?: string;
  lastUpdated: Date;
}