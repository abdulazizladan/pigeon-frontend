/** Fuel products every station sells. Each pump sells one; each station has one reservoir per product. */
export type Product = 'petrol' | 'diesel' | 'kerosene';

export const PRODUCTS: Product[] = ['petrol', 'diesel', 'kerosene'];

export const PRODUCT_LABELS: Record<Product, string> = {
  petrol: 'Petrol (PMS)',
  diesel: 'Diesel (AGO)',
  kerosene: 'Kerosene (DPK)',
};

export function productLabel(product: Product): string {
  return PRODUCT_LABELS[product] ?? product;
}

export interface ProductPrice {
  product: Product;
  /** ₦ per litre, or null when no price has been set yet. */
  pricePerLitre: number | null;
  updatedAt: string | null;
}

export type PumpStatus = 'active' | 'inactive';

export interface Pump {
  id: string;
  stationId: string;
  name: string;
  product: Product;
  status: PumpStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Reservoir {
  id: string;
  stationId: string;
  product: Product;
  capacityLitres: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePumpPayload {
  name: string;
  product: Product;
  status?: PumpStatus;
}

export interface UpdatePumpPayload {
  name?: string;
  product?: Product;
  status?: PumpStatus;
}

export interface CreateReservoirPayload {
  product: Product;
  capacityLitres: number;
}

export interface UpdateReservoirPayload {
  capacityLitres?: number;
}
