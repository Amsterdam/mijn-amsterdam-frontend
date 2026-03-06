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
import { createNotificationId } from '../../../universal/helpers/notification';
import { MyNotification } from '../../../universal/types/App.types';
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

  const datePublished = new Date().toISOString();
  const cta = 'Bekijk uw openstaande facturen';
  const linkTo = routeConfig.themaPage.path;

  // Determine the newest factuur datePublished to ensure that the notification id is unique over time.
  // All facturen are used because if the latest open factuur is paid but the others are not, we do not want to change the notification id.
  const lastFactuurDate = facturen
    .map((factuur) => factuur.datePublished ?? '')
    .reduce((latest, factuurDatePublished) => {
      return factuurDatePublished > latest ? factuurDatePublished : latest;
    });

  return {
    id: createNotificationId(themaId, 'open', lastFactuurDate),
    datePublished,
    themaID: themaId,
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
