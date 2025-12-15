import { myThemasMenuItems } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';
import { themaId as themaIdNotificaties } from '../pages/MyNotifications/MyNotifications-config';

export const REDACTED_CLASS = 'redacted';

const otherContentRedactedItems = [
  'Algemeen',
  'Meldingen',
  themaIdNotificaties,
].map((i) => ({
  id: i,
  redactedScope: 'content',
}));

const hasRedactedClass = (
  themaId: string,
  scope: Required<ThemaMenuItem>['redactedScope']
) => {
  const items = [...otherContentRedactedItems, ...myThemasMenuItems];
  const themaMenuItem = items.find(
    (item) => item.id.toUpperCase() === themaId.toUpperCase()
  );
  const redactedScope = themaMenuItem?.redactedScope;
  return (
    !themaMenuItem ||
    redactedScope === 'full' ||
    (redactedScope === 'content' && scope === 'content')
  );
};
export function getRedactedClass(
  themaId?: string | null,
  scope: Required<ThemaMenuItem>['redactedScope'] = 'full'
) {
  if (themaId && !hasRedactedClass(themaId, scope)) {
    return '';
  }
  return REDACTED_CLASS;
}
