import { Manager } from './manager.model';
import { Pump } from './pump.model';

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
  manager: Manager;
  pumps: Pump[];
  sales: any[];
  lastUpdated: Date;
}

