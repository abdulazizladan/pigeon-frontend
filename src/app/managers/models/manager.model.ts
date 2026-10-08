import { User } from '../../users-management/models/user.model';

export interface ManagerStationRef {
  id: string;
  name: string;
  code: string;
}

/** A manager as returned by /managers: the user record plus the station they run. */
export interface Manager extends User {
  station: ManagerStationRef | null;
}
