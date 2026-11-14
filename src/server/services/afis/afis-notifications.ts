import { themaConfig } from '../../../client/apps/bob/pages/Thema/Afis/Afis-thema-config.ts';
import {
  apiSuccessResult,
  hasFailedDependency,
} from '../../../universal/helpers/api.ts';
import {
  type MyNotification,
  NOTIFICATION_SORTPRIORITY,
} from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { sanitizeStringTemplate } from '../../helpers/text.ts';
import { fetchAfisAccounts } from './afis.ts';
import { fetchAfisFacturenOverview } from './afis-facturen.ts';
import type { AfisFactuur, AfisFactuurStatus } from './afis-types.ts';

const facturenOpen: AfisFactuurStatus[] = [
  'openstaand',
  'gedeeltelijke-betaling',
  'herinnering',
  'handmatig-betalen',
];

export function createAfisFacturenNotification(
  facturen: AfisFactuur[]
): MyNotification | null {
  const openFacturen = facturen.filter((factuur) =>
    facturenOpen.includes(factuur.status)
  );

  if (!openFacturen.length) {
    return null;
  }

  const openFacturenCount = openFacturen.length;
  const openFacturenHerinneringCount = openFacturen.filter(
    (factuur) => factuur.status === 'herinnering'
  ).length;

  const title = 'Betaal tijdig om extra kosten te voorkomen';
  const isMulti = openFacturenHerinneringCount > 1;
  const description = sanitizeStringTemplate(`
    U heeft ${openFacturenCount} openstaande facturen.
    ${openFacturenHerinneringCount ? `Van ${openFacturenHerinneringCount} ${isMulti ? 'facturen' : 'factuur'} heeft u inmiddels een herinnering ontvangen per e-mail of post.` : ''}
  `);

  const cta = 'Bekijk uw openstaande facturen';
  const linkTo = themaConfig.route.path;

  // Uses the most recent published open or paid factuur.
  // Using only the latest open factuur would cause the datePublished to change
  // to an earlier date when that factuur is paid while older ones remain open.
  const mostRecentDatePublished = facturen
    .map((factuur) => factuur.datePublished ?? '')
    .reduce((latest, factuurDatePublished) => {
      return factuurDatePublished > latest ? factuurDatePublished : latest;
    });

  return {
    id: `facturen-open-notification`,
    datePublished: mostRecentDatePublished,
    sortPriority: NOTIFICATION_SORTPRIORITY.high,
    hideDatePublished: true,
    themaID: themaConfig.id,
    themaTitle: themaConfig.title,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchAfisNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const accounts = await fetchAfisAccounts(authProfileAndToken);
  const results =
    accounts.status === 'OK'
      ? await Promise.all(
          (accounts.content ?? []).map((account) =>
            fetchAfisFacturenOverview(authProfileAndToken.profile.sid, {
              businessPartnerID: account.businessPartnerId,
            })
          )
        )
      : [];
  const isIncomplete =
    accounts.status !== 'OK' ||
    results.some(
      (result) =>
        result.status !== 'OK' ||
        hasFailedDependency(result, 'open') ||
        !result.content?.open
    );

  if (isIncomplete) {
    const warning: MyNotification = {
      id: 'facturen-open-notification',
      themaID: themaConfig.id,
      themaTitle: themaConfig.title,
      title: 'Aantal openstaande facturen niet beschikbaar',
      description:
        'Wij kunnen het totale aantal openstaande facturen nu niet tonen. Probeer het later opnieuw.',
      datePublished: new Date().toISOString(),
      hideDatePublished: true,
      sortPriority: NOTIFICATION_SORTPRIORITY.high,
      link: { to: themaConfig.route.path, title: 'Bekijk uw facturen' },
    };
    return apiSuccessResult({ notifications: [warning] });
  }

  const facturen = results.flatMap(
    (result) => result.content?.open?.facturen ?? []
  );
  const notification = createAfisFacturenNotification(facturen);
  return apiSuccessResult({
    notifications: notification ? [notification] : [],
  });
}
