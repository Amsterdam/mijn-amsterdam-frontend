import { useInterval } from '../../../hooks/timer.hook';

// This component is used to refetch the eMandate data at a regular interval,
const POLLING_INTERVAL_MS = 4000; // 4 seconds

export function AfisEmandateRefetchInterval({ fetch }: { fetch: () => void }) {
  useInterval(fetch, POLLING_INTERVAL_MS);
  return null;
}
