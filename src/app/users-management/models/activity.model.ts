import { UserRole } from './user.model';

/** One recorded action by a user, as returned by GET /users/:id/activities. */
export interface Activity {
  id: string;
  actorId: string;
  actorUsername: string;
  actorRole: UserRole;
  /** Dotted verb such as `station.created` or `auth.login`. */
  action: string;
  description: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export type ActivityGroup = 'auth' | 'user' | 'station' | 'equipment' | 'sales' | 'ticket' | 'other';

/** Buckets actions so the timeline can pick an icon and colour. */
export function activityGroup(action: string): ActivityGroup {
  const [domain] = action.split('.');
  switch (domain) {
    case 'auth': return 'auth';
    case 'user':
    case 'manager': return 'user';
    case 'station': return 'station';
    case 'price':
    case 'pump':
    case 'reservoir': return 'equipment';
    case 'daily_record': return 'sales';
    case 'ticket': return 'ticket';
    default: return 'other';
  }
}

/** "3 minutes ago", "yesterday", or a date for anything older than a week. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
