import { BFF_API_BASE_URL } from '../config/api';

export function relayApiUrl(path: string) {
  return `${BFF_API_BASE_URL}/relay${path}`;
}
