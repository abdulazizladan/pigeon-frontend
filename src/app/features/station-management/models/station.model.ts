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
  pricePerLiter: number;
  status: string;
  createdAt: number;
  manager: Manager;
  pumps: Pump[];
}

