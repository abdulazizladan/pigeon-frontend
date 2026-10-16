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

/** Body for POST /managers: a user without the role, which is always manager. */
export interface CreateManagerPayload {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
}
