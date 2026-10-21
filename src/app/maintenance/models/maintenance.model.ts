import { Product } from '../../stations/models/equipment.model';

export type StationCondition = 'good' | 'fair' | 'faulty';
export type PumpCondition = 'ok' | 'faulty' | 'out_of_service';
export type RepairPriority = 'low' | 'medium' | 'high';
export type RepairStatus = 'pending' | 'authorized' | 'denied' | 'ignored';
export type RepairDecision = 'authorize' | 'deny' | 'ignore';

export const STATION_CONDITIONS: StationCondition[] = ['good', 'fair', 'faulty'];
export const PUMP_CONDITIONS: PumpCondition[] = ['ok', 'faulty', 'out_of_service'];
export const REPAIR_PRIORITIES: RepairPriority[] = ['high', 'medium', 'low'];
export const REPAIR_STATUSES: RepairStatus[] = ['pending', 'authorized', 'denied', 'ignored'];
export const REPAIR_DECISIONS: RepairDecision[] = ['authorize', 'deny', 'ignore'];

export function stationConditionLabel(c: StationCondition): string {
  return { good: 'Good', fair: 'Fair', faulty: 'Faulty' }[c];
}

export function stationConditionDescription(c: StationCondition): string {
  return {
    good: 'Everything working as it should',
    fair: 'Minor issues, trading not affected',
    faulty: 'Something needs attention',
  }[c];
}

export function pumpConditionLabel(c: PumpCondition): string {
  return { ok: 'OK', faulty: 'Faulty', out_of_service: 'Out of service' }[c];
}

export function repairPriorityLabel(p: RepairPriority): string {
  return { high: 'High / urgent', medium: 'Medium', low: 'Low' }[p];
}

export function repairPriorityDescription(p: RepairPriority): string {
  return {
    high: 'Unusable or unsafe; fix as soon as possible',
    medium: 'Affects operations; fix this week',
    low: 'Cosmetic or minor; fix when convenient',
  }[p];
}

export function repairStatusLabel(s: RepairStatus): string {
  return { pending: 'Pending', authorized: 'Authorized', denied: 'Denied', ignored: 'No action' }[s];
}

export function repairDecisionLabel(d: RepairDecision): string {
  return { authorize: 'Authorize repair', deny: 'Deny', ignore: 'No action for now' }[d];
}

export function repairDecisionDescription(d: RepairDecision): string {
  return {
    authorize: 'The manager may go ahead with the repair',
    deny: 'The repair will not be done; tell the manager why',
    ignore: 'Leave it pending in spirit: you can decide later',
  }[d];
}

export interface PumpCheck {
  id: string;
  healthCheckId: string;
  pumpId: string;
  pumpName: string;
  product: Product;
  condition: PumpCondition;
  notes: string | null;
}

export interface HealthCheckReport {
  id: string;
  stationId: string;
  recordedOn: string;
  stationCondition: StationCondition;
  notes: string | null;
  recordedById: string | null;
  recordedByUsername: string | null;
  createdAt: string;
  updatedAt: string;
  pumps: PumpCheck[];
  faultyPumps: number;
}

export interface HealthCheckTemplate {
  station: { id: string; name: string; code: string };
  recordedOn: string;
  lastRecordedOn: string | null;
  lastStationCondition: StationCondition | null;
  pumps: { pumpId: string; name: string; product: Product; status: string; lastCondition: PumpCondition | null }[];
}

export interface PumpCheckInput {
  pumpId: string;
  condition: PumpCondition;
  notes?: string;
}

export interface CreateHealthCheckPayload {
  stationId?: string;
  recordedOn?: string;
  stationCondition: StationCondition;
  notes?: string;
  pumps: PumpCheckInput[];
}

export type UpdateHealthCheckPayload = Omit<CreateHealthCheckPayload, 'stationId' | 'recordedOn'>;

export interface HealthChecksQuery {
  stationId: string | null;
  from: string;
  to: string;
}

export interface RepairRequest {
  id: string;
  stationId: string;
  stationName: string;
  pumpId: string | null;
  pumpName: string | null;
  facility: string;
  description: string;
  priority: RepairPriority;
  status: RepairStatus;
  healthCheckId: string | null;
  requestedById: string | null;
  requestedByUsername: string | null;
  decidedById: string | null;
  decidedByUsername: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepairRequestPayload {
  stationId?: string;
  pumpId?: string;
  facility: string;
  description: string;
  priority: RepairPriority;
  healthCheckId?: string;
}

export interface DecideRepairRequestPayload {
  decision: RepairDecision;
  note?: string;
}

export interface RepairRequestsQuery {
  stationId: string | null;
  status: RepairStatus | null;
  priority: RepairPriority | null;
}

export interface RepairRequestStats {
  total: number;
  byStatus: Record<RepairStatus, number>;
  pendingByPriority: Record<RepairPriority, number>;
}

/** What the report-fault modal opens with: the station it is for and, optionally, the pump. */
export interface RepairReportPrefill {
  stationId: string | null;
  pumpId?: string | null;
  facility?: string;
  healthCheckId?: string | null;
}

/** A decided request can no longer be changed, except an ignored one, which a director may revisit. */
export function canDecide(status: RepairStatus): boolean {
  return status === 'pending' || status === 'ignored';
}
