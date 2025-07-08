import { fetchIsKnownInAFIS } from './afis.ts';
import { AfisFactuur, AfisFactuurStatus } from './afis-types.ts';
import {
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Afis/Afis-thema-config.ts';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { MyNotification } from '../../../universal/types/App.types.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { sanitizeStringTemplate } from '../../helpers/text.ts';

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

  return {
    id: `facturen-open-notification`,
    datePublished,
    themaID: themaId,
    themaTitle: themaTitle,
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
