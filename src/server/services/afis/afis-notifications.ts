import { fetchIsKnownInAFIS } from './afis';
import { AfisFactuur, AfisFactuurStatus } from './afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';

const facturenOpen: AfisFactuurStatus[] = [
  'openstaand',
  'gedeeltelijke-betaling',
  'herinnering',
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
  const description = `
  U heeft ${openFacturenCount} openstaande facturen.
  ${openFacturenHerinneringCount ? `Van ${openFacturenHerinneringCount} factuur${openFacturenHerinneringCount > 1 ? 'en' : ''} heeft u inmiddels een herinnering ontvangen per e-mail of post.` : ''}`;

  const datePublished = openFacturen[0]?.datePublished ?? '';
  const cta = 'Bekijk uw openstaande facturen';
  const linkTo = AppRoutes.AFIS;

  return {
    id: `facturen-open-notification`,
    datePublished,
    thema: Themas.AFIS,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchAfisNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const afisKnownResponse = await fetchIsKnownInAFIS(
    requestID,
    authProfileAndToken
  );

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
