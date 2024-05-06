import { BFF_API_BASE_URL } from '../config/api';
import { WerkzaamhedenEnVervoerOpStraat } from '../../server/services';

export function relayApiUrl(path: string) {
  return `${BFF_API_BASE_URL}/relay${path}`;
}
