import { Badge, Link, Paragraph } from '@amsterdam/design-system-react';
import { differenceInCalendarMonths } from 'date-fns';
import { generatePath } from 'react-router';

import { MAXIMUM_AGE_BEFORE_VALIDATION } from './CommunicatieVoorkeuren-config.ts';
import styles from './CommunicatieVoorkeuren.module.scss';
import type { ContactgegevenFrontend } from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import {
  routeConfig,
  type InstelAction,
} from '../KlantContact-thema-config.ts';

type CommunicatieMediumValueProps = {
  medium: ContactgegevenFrontend;
  noValueText?: string;
};

function Value({
  medium,
  noValueText = 'Nog niet opgegeven',
}: CommunicatieMediumValueProps) {
  return <>{medium.value ? medium.value : <em>{noValueText}</em>} </>;
}

type ValueActionsProps = {
  medium: ContactgegevenFrontend;
  path?: string;
  actionLabels?: {
    on: string;
    off: string;
  };
};

function ValueActions({
  medium,
  path,
  actionLabels = { on: 'Instellen', off: 'Wijzigen' },
}: ValueActionsProps) {
  const LinkComponent = path?.startsWith('http') ? Link : MaRouterLink;
  return (
    <span className={styles.ValueActions}>
      {path && (
        <LinkComponent href={path}>
          {medium.value ? actionLabels.off : actionLabels.on}
        </LinkComponent>
      )}
    </span>
  );
}

type MediumValueProps = {
  medium: ContactgegevenFrontend;
};

export function MediumValue({ medium }: MediumValueProps) {
  const getRoute = (step: '1' | '2', action: InstelAction = 'instellen') =>
    generatePath(routeConfig.detailPageCommunicatieMediumInstellen.path, {
      medium: medium.type,
      step,
      action,
    });
  const route = getRoute('1', medium.value ? 'wijzigen' : 'instellen');

  switch (medium.type) {
    case 'email': {
      const isOld =
        !!(medium.dateModified && medium.isValidated) &&
        differenceInCalendarMonths(new Date(), medium.dateModified) >=
          MAXIMUM_AGE_BEFORE_VALIDATION;
      const needsValidation = !!medium.value && (!medium.isValidated || isOld);
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Voor sommige diensten is het belangrijk dat het e-mailadres actief
            beheerd wordt.
          </Paragraph>
          <Paragraph className="ams-mb-s">
            <Value medium={medium} />{' '}
            {medium.value && medium.isValidated && (
              <>(Laatst gevalideerd op {medium.dateModifiedFormatted})</>
            )}{' '}
            {needsValidation && (
              <>
                {!isOld ? (
                  <>
                    <Badge label="!" color="red" /> Dit e-mailadres is nog niet
                    gevalideerd.{' '}
                  </>
                ) : (
                  ''
                )}
                <ValueActions
                  medium={medium}
                  path={getRoute('1', 'valideren')}
                  actionLabels={{
                    off: isOld ? 'Opnieuw valideren' : 'Nu valideren',
                    on: 'Wijzigen',
                  }}
                />
              </>
            )}
            {needsValidation ? ' of ' : ''}
            <ValueActions medium={medium} path={route} />
          </Paragraph>
        </>
      );
    }
    case 'phone': {
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Voor sommige diensten is het belangrijk dat het telefoonnummer
            actief beheerd wordt.
          </Paragraph>
          <Paragraph>
            <Value medium={medium} />{' '}
            <ValueActions medium={medium} path={route} />
          </Paragraph>
        </>
      );
    }
    case 'app': {
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Als u de Amsterdam App download en toestemming geeft om meldingen
            van Mijn Amsterdam te versturen.
          </Paragraph>
          <Paragraph>
            <Value medium={medium} noValueText="Nog niet gekoppeld" />
            {medium.value && medium.isValidated && (
              <>(Gekoppeld op {medium.dateModifiedFormatted})</>
            )}{' '}
            <ValueActions
              medium={medium}
              path={route}
              actionLabels={{ on: 'Koppelen', off: 'Ontkoppelen' }}
            />
          </Paragraph>
        </>
      );
    }
    case 'berichtenbox': {
      return (
        <>
          <Paragraph size="small" className="ams-mb-s">
            Als u de berichtbox toestemming heeft gegeven om namens gemeente
            Amsterdam te versturen.
          </Paragraph>
          <Paragraph>
            <Value medium={medium} noValueText="Nog niet gekoppeld" />{' '}
            <ValueActions
              medium={medium}
              path={route}
              actionLabels={{ on: 'Koppelen', off: 'Ontkoppelen' }}
            />
          </Paragraph>
        </>
      );
    }
    // Add more cases for other communication mediums
    case 'postadres': {
      return (
        <>
          <Paragraph size="small">
            Klopt het adres niet of gaat u verhuizen? U kunt u hier uw nieuwe
            postadres doorgeven.
          </Paragraph>
          <Paragraph>
            <Value medium={medium} noValueText="Geen postadres bekend" />{' '}
            <ValueActions
              medium={medium}
              path="https://www.amsterdam.nl/burgerzaken/verhuizen-inschrijving-briefadres/"
              actionLabels={{
                on: 'Wijziging doorgeven',
                off: 'Wijziging doorgeven',
              }}
            />
          </Paragraph>
        </>
      );
    }
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
