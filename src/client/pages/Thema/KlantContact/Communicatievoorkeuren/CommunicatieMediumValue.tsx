import { Link, Paragraph } from '@amsterdam/design-system-react';
import { differenceInCalendarMonths } from 'date-fns';
import { generatePath } from 'react-router';

import { MAXIMUM_AGE_BEFORE_VALIDATION } from './CommunicatieVoorkeuren-config.ts';
import type { CommunicatieMedium } from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { routeConfig } from '../KlantContact-thema-config.ts';

type CommunicatieMediumValueProps = {
  medium: CommunicatieMedium;
  path?: string;
  noValueText?: string;
  actionLabels?: {
    on: string;
    off: string;
  };
};

function Value({
  medium,
  path,
  noValueText = 'Nog niet opgegeven',
  actionLabels = { on: 'Wijzigen', off: 'Instellen' },
}: CommunicatieMediumValueProps) {
  const LinkComponent = path?.startsWith('http') ? Link : MaRouterLink;
  return (
    <>
      {medium.value ? medium.value : <em>{noValueText}</em>}{' '}
      {path && (
        <LinkComponent href={path}>
          {medium.value ? actionLabels.on : actionLabels.off}
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
        <>
          <Paragraph size="small" className="ams-mb-s">
            Voor sommige diensten is het belangrijk dat het e-mailadres actief
            beheerd wordt.
          </Paragraph>
          <Value
            path={generatePath(
              routeConfig.detailPageCommunicatieMediumInstellen.path,
              { medium: medium.type, step: '1' }
            )}
            medium={medium}
          />
          {medium.dateModified &&
            differenceInCalendarMonths(new Date(), medium.dateModified) >=
              MAXIMUM_AGE_BEFORE_VALIDATION && (
              <Paragraph size="small" className="ams-mb-s">
                Het e-mailadres is langer dan 6 maanden niet bijgewerkt.
              </Paragraph>
            )}
        </>
      );
    case 'phone':
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Voor sommige diensten is het belangrijk dat het telefoonnummer
            actief beheerd wordt.
          </Paragraph>
          <Value
            medium={medium}
            path={generatePath(
              routeConfig.detailPageCommunicatieMediumInstellen.path,
              { medium: medium.type, step: '1' }
            )}
          />
        </>
      );
    case 'app':
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Als u de Amsterdam App download en toestemming geeft om meldingen
            van Mijn Amsterdam te versturen.
          </Paragraph>
          <Value
            medium={medium}
            noValueText="Nog niet gekoppeld"
            actionLabels={{ on: 'Koppelen', off: 'Koppelen' }}
            path={generatePath(
              routeConfig.detailPageCommunicatieMediumInstellen.path,
              { medium: medium.type, step: '1' }
            )}
          />
        </>
      );
    case 'berichtenbox':
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Als u de berichtbox toestemming heeft gegeven om namens gemeente
            Amsterdam te versturen.
          </Paragraph>
          <Value
            medium={medium}
            noValueText="Nog niet gekoppeld"
            actionLabels={{ on: 'Koppelen', off: 'Koppelen' }}
            path={generatePath(
              routeConfig.detailPageCommunicatieMediumInstellen.path,
              { medium: medium.type, step: '1' }
            )}
          />
        </>
      );
    // Add more cases for other communication mediums
    case 'postadres':
      return (
        <Value
          medium={medium}
          path="https://www.amsterdam.nl/burgerzaken/verhuizen-inschrijving-briefadres/"
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
