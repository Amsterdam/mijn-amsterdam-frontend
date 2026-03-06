import { fetchIsKnownInAFIS } from './afis';
import { AfisFactuur, AfisFactuurStatus } from './afis-types';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Afis/Afis-thema-config';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import {
  MyNotification,
  NOTIFICATION_PRIORITY,
} from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { sanitizeStringTemplate } from '../../helpers/text';

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
  const linkTo = routeConfig.themaPage.path;

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
    hideDatePublished: true,
    themaID: themaId,
    priority: NOTIFICATION_PRIORITY.high,
    themaTitle,
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
  const afisKnownResponse = await fetchIsKnownInAFIS(authProfileAndToken);

  if (afisKnownResponse.status === 'ERROR') {
    return apiDependencyError({ afis: afisKnownResponse });
  }

  const facturen = afisKnownResponse.content?.facturen?.open?.facturen ?? [];
  const notifications = [];
  const notification = createAfisFacturenNotification(facturen);

  if (notification) {
    notifications.push(notification);
  }

  return apiSuccessResult({
    notifications,
  });
}
