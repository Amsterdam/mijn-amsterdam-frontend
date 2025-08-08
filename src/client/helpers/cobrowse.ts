import { FeatureToggle } from '../../universal/config/feature-toggles';
import { myThemasMenuItems } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';

const REDACTED_CLASS = 'cobrowse-redacted';
const hasRedactedClass = (
  themaId: string,
  scope: Required<ThemaMenuItem>['redactedScope']
) => {
  if (!FeatureToggle.cobrowseIsActive) {
    return false;
  }
  const redactedScope = myThemasMenuItems.find(
    (item) => item.id === themaId
  )?.redactedScope;
  return (
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
