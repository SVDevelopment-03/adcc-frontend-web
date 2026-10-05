/** Statuses that mean an event is over regardless of its date. */
const CLOSED_STATUSES = ['Completed', 'Closed', 'Archived'];

type EventLike = { eventDate?: string | Date | null; status?: string | null };

const eventTime = (event: EventLike): number => {
  if (!event.eventDate) return NaN;
  return new Date(event.eventDate).getTime();
};

/**
 * An event is closed once its date has passed (it stays open through the whole
 * event day) or its status says it is over.
 */
export const isEventClosed = (event: EventLike): boolean => {
  if (event.status && CLOSED_STATUSES.includes(event.status)) return true;
  const time = eventTime(event);
  if (Number.isNaN(time)) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return time < startOfToday.getTime();
};

/**
 * Open events first (soonest first), closed events last (most recently ended
 * first). Mirrors the ordering of GET /v1/events.
 */
export const sortClosedEventsLast = <T extends EventLike>(events: T[]): T[] => {
  return [...events].sort((a, b) => {
    const aClosed = isEventClosed(a);
    const bClosed = isEventClosed(b);
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    const aTime = eventTime(a);
    const bTime = eventTime(b);
    if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
    return aClosed ? bTime - aTime : aTime - bTime;
  });
};

type ChallengeLike = { endDate?: string | Date | null; startDate?: string | Date | null; status?: string | null };

const startOfToday = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/**
 * A challenge is closed once its end date has passed (it stays open through
 * the whole end day) or its status says it is completed.
 */
export const isChallengeClosed = (challenge: ChallengeLike): boolean => {
  if (challenge.status === 'Completed') return true;
  if (!challenge.endDate) return false;
  const end = new Date(challenge.endDate).getTime();
  return !Number.isNaN(end) && end < startOfToday();
};

/**
 * Open challenges first (earliest start first), closed challenges last (most
 * recently ended first). Mirrors the ordering of GET /v1/challenges.
 */
export const sortClosedChallengesLast = <T extends ChallengeLike>(challenges: T[]): T[] => {
  const time = (value?: string | Date | null) => (value ? new Date(value).getTime() : NaN);
  return [...challenges].sort((a, b) => {
    const aClosed = isChallengeClosed(a);
    const bClosed = isChallengeClosed(b);
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    const diff = aClosed ? time(b.endDate) - time(a.endDate) : time(a.startDate) - time(b.startDate);
    return Number.isNaN(diff) ? 0 : diff;
  });
};
