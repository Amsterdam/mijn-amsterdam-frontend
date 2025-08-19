import { FeatureToggle } from '../../universal/config/feature-toggles';
import { myThemasMenuItems } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';
import { themaId as themaIdNotificaties } from '../pages/MyNotifications/MyNotifications-config';

const REDACTED_CLASS = 'cobrowse-redacted';
const otherAllowedIds = ['Algemeen', 'Meldingen', themaIdNotificaties].map(
  (i) => ({
    id: i,
    redactedScope: 'content',
  })
) as ThemaMenuItem[];
const hasRedactedClass = (
  themaId: string,
  scope: Required<ThemaMenuItem>['redactedScope']
) => {
  if (!FeatureToggle.cobrowseIsActive) {
    return false;
  }
  const items = [...otherAllowedIds, ...myThemasMenuItems];
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
  if (
    !FeatureToggle.cobrowseIsActive ||
    (themaId && !hasRedactedClass(themaId, scope))
  ) {
    return '';
  }
  return REDACTED_CLASS;
}
