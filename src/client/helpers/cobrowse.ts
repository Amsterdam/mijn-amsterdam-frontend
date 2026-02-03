import memoizee from 'memoizee';
import { create } from 'zustand';

import { myThemasMenuItems } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';
import { themaId as themaIdNotificaties } from '../pages/MyNotifications/MyNotifications-config';

type CobrowseState = {
  isScreensharing: boolean;
};

type CobrowseAction = {
  setIsScreensharing: (
    isScreensharing: CobrowseState['isScreensharing']
  ) => void;
};

export const useCobrowseStore = create<CobrowseState & CobrowseAction>(
  (set) => ({
    isScreensharing: true,
    setIsScreensharing: (isScreensharing) => set(() => ({ isScreensharing })),
  })
);

export const useCobrowseScreenshareState = () =>
  useCobrowseStore((state) => state.isScreensharing);

export const REDACTED_CLASS = 'redacted';

const otherContentRedactedItems = [
  'Algemeen',
  'Meldingen',
  themaIdNotificaties,
].map((i) => ({
  id: i,
  redactedScope: 'content',
}));

const getRedactedItemsByID = memoizee(function getRedactedItemsByID() {
  return Object.fromEntries(
    [...otherContentRedactedItems, ...myThemasMenuItems].map((item) => {
      return [item.id.toUpperCase(), item.redactedScope] as const;
    })
  );
});

export type ScopeRequested = Extract<
  Required<ThemaMenuItem>['redactedScope'],
  'content' | 'full'
>;

// Determines if redaction is required based on themaId and/or requested scope.
// ReactedScope provded by thema config takes precedence over requested scope.
function isRedactionRequired(
  themaId?: string | null,
  scopeRequested?: ScopeRequested
) {
  const redactedByID = getRedactedItemsByID();
  const themaIdUpper = themaId ? themaId.toUpperCase() : undefined;
  const themaExists = themaIdUpper ? themaIdUpper in redactedByID : false;
  const redactedScope = themaIdUpper ? redactedByID[themaIdUpper] : undefined;
  return (
    // If themaId was passed but thema not found, we consider it fully redacted, for safety.
    (!redactedScope && themaId && !themaExists) ||
    // If no themaId was passed, we consider it fully redacted if 'full' redaction is requested.
    // For example pages without themaId but with the need to redact (GeneralInfo, ZaakStatus).
    (!themaId && scopeRequested === 'full') ||
    // Configured redacted scope 'full' overrides everything, even if we only request 'content' redaction.
    redactedScope === 'full' ||
    // 'content' redaction is only applied when specifically requested and explicitly configured.
    (redactedScope === 'content' && scopeRequested === 'content')
  );
}

export function getRedactedClass(
  themaId?: string | null,
  scopeRequested?: ScopeRequested
) {
  if (isRedactionRequired(themaId, scopeRequested)) {
    return REDACTED_CLASS;
  }

  return '';
}
