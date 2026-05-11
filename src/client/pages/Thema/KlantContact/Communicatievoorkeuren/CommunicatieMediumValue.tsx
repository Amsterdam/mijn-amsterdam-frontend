import { Link } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router';

import type { CommunicatieMedium } from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { routeConfig } from '../KlantContact-thema-config.ts';

type CommunicatieMediumValueProps = {
  medium: CommunicatieMedium;
  path?: string;
};

function Value({ medium, path }: CommunicatieMediumValueProps) {
  const LinkComponent = path?.startsWith('http') ? Link : MaRouterLink;
  return (
    <>
      {medium.value ? medium.value : <em>nog niet opgegeven</em>}{' '}
      {path && (
        <LinkComponent href={path}>
          {medium.value ? 'Wijzigen' : 'Instellen'}
        </LinkComponent>
      )}
    </>
  );
}

type MediumValueProps = {
  medium: CommunicatieMedium;
};

export function MediumValue({ medium }: MediumValueProps) {
  switch (medium.type) {
    case 'email':
      return (
        <Value
          path={generatePath(
            routeConfig.detailPageCommunicatieMediumInstellen.path,
            { medium: medium.type, step: '1' }
          )}
          medium={medium}
        />
      );
    // Add more cases for other communication mediums
    case 'postadres':
      return (
        <Value
          medium={medium}
          path="https://www.amsterdam.nl/burgerzaken/verhuizen-inschrijving-briefadres/"
        />
      );
    case 'phone':
      return (
        <Value
          medium={medium}
          path={generatePath(
            routeConfig.detailPageCommunicatieMediumInstellen.path,
            { medium: medium.type, step: '1' }
          )}
        />
      );
    default:
      return null;
  }
}

//  {
//    !voorkeur.settings.some((m) => m.isActive) && (
//      <Alert
//        className="ams-mb-m"
//        heading="Geen voorkeuren doorgegeven."
//        severity="warning"
//        headingLevel={4}
//      >
//        <Paragraph>
//          Er zijn op dit moment geen voorkeuren actief voor dit onderwerp.{' '}
//        </Paragraph>
//        <Paragraph>
//          Dit betekent dat wij u geen brieven, e-mails of sms-berichten sturen
//          over dit onderwerp.
//        </Paragraph>
//        <Paragraph>
//          U kunt uw voorkeuren instellen door op de <strong>Actief</strong> knop
//          te klikken.
//        </Paragraph>
//      </Alert>
//    );
//  }
