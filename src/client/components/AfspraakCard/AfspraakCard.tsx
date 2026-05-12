import {
  Button,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';
import {
  CalendarIcon,
  PersonAtDeskIcon,
} from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';
import { isAfter } from 'date-fns';

import styles from './AfspraakCard.module.scss';
import { getRedactedClass } from '../../helpers/cobrowse.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { useDateNow } from '../../hooks/timer.hook.ts';
import { themaConfig } from '../../pages/Thema/KlantContact/KlantContact-thema-config.ts';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useKlantcontactData.hook.tsx';
import { CalendarLink } from '../CalendarLink/CalendarLink.tsx';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import maLinkStyles from '../MaLink/MaLink.module.scss';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontendFinal;
  className?: string;
};

type AfspraakCardsProps = {
  afspraken: AfspraakFrontendFinal[];
  className?: string;
};

function CardBody({ afspraak }: AfspraakCardProps) {
  return (
    <>
      <Paragraph>{afspraak.displayDate}</Paragraph>
      {/* Without this div the LocationModal is not clickable. */}
      <div>
        <LocationModal
          address={`${afspraak.location.street}`}
          className={classNames(
            'ams-link',
            maLinkStyles.MaLink,
            styles.LocationModalLink
          )}
        >
          {`Locatie Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`}
        </LocationModal>
      </div>
      <CalendarLink
        className={classNames(styles.Block, 'ams-mb-s')}
        icsData={{
          start: afspraak.startDate,
          end: afspraak.endDate,
          uid: `afspraak-stadsloket-${afspraak.caseReference}`,
          summary: `Afspraak voor ${afspraak.subject}`,
          description: `Referentienummer: ${afspraak.caseReference}`,
          location: `Stadsloket ${afspraak.location.name}, ${afspraak.location.street}, ${afspraak.location.postalCode} ${afspraak.location.city}, Nederland`,
        }}
      >
        Voeg toe aan uw privé-agenda
      </CalendarLink>
    </>
  );
}

function CancellationLink({ afspraak, className }: AfspraakCardProps) {
  // To prevent a user from thinking that they can still cancel when not refreshing the screen.
  const now = useDateNow();
  const isAbleToCancel = isAfter(afspraak.startDate, now);
  if (!isAbleToCancel) {
    return (
      <div
        title="De afspraak is gestart en kan niet meer geannuleerd worden."
        aria-hidden="true"
        className={classNames(className, 'ams-link', styles.DisabledLink)}
      >
        Annuleren
      </div>
    );
  }
  return (
    <MaLink className={className} href={afspraak.cancellationLink}>
      Annuleren
    </MaLink>
  );
}

export function AfspraakCard({ afspraak, className }: AfspraakCardProps) {
  const isSmallScreen = useSmallScreen();

  const TitleHeading: React.FC<{ className?: string }> = ({ className }) => (
    <Heading level={3} className={className ?? ''}>
      {afspraak.subject}
    </Heading>
  );

  const icon = <Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>;

  if (isSmallScreen) {
    return (
      <Row className={className}>
        <Column>
          <Row gap="none">
            <TitleHeading className={styles.SmallScreenHeading}></TitleHeading>
            {icon}
          </Row>
          <CardBody afspraak={afspraak} />
          <Row alignVertical="center">
            <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
              <Button variant="secondary">Toon QR code</Button>
            </MaRouterLink>
            <CancellationLink
              afspraak={afspraak}
              className={styles.SmallScreenCancellationLink}
            ></CancellationLink>
          </Row>
        </Column>
      </Row>
    );
  }
  return (
    <Row className={className} gap="large">
      {icon}
      <Column
        className={
          styles.ColumnLargeScreen /* Make sure `cancellationLink` is always in the same spot for alignment. */
        }
      >
        <TitleHeading></TitleHeading>
        <CardBody afspraak={afspraak} />
        <Row alignVertical="center">
          <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
            <Button variant="secondary">Toon QR code</Button>
          </MaRouterLink>
        </Row>
      </Column>
      <CancellationLink afspraak={afspraak}></CancellationLink>
    </Row>
  );
}

export function AfspraakCards({ afspraken }: AfspraakCardsProps) {
  const afspraakCards = afspraken.map((afspraak) => {
    return (
      <AfspraakCard
        className={classNames(
          getRedactedClass(),
          'ams-mb-m',
          styles.CardListContainer
        )}
        key={afspraak.caseReference}
        afspraak={afspraak}
      ></AfspraakCard>
    );
  });
  return afspraakCards;
}

export function AfspraakCardsDashboard({ afspraken }: AfspraakCardsProps) {
  const isSmallScreen = useSmallScreen();
  const afspraakCards = afspraken.map((afspraak) => {
    return (
      <Row
        key={afspraak.caseReference}
        className={classNames(
          'ams-mb-m',
          getRedactedClass(themaConfig.id, 'content')
        )}
      >
        <Column>
          <Heading
            level={3}
            className={isSmallScreen ? '' : styles.LargeScreenDashboardHeading}
          >
            {afspraak.subject}
          </Heading>
          <CardBody afspraak={afspraak} />
          <MaRouterLink href={afspraak.qrCodeHref}>Toon QR code</MaRouterLink>
        </Column>
        <Icon size="large" svg={CalendarIcon} />
      </Row>
    );
  });
  return afspraakCards;
}
