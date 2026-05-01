import {
  Button,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';

import styles from './AfspraakCard.module.scss';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useAfsprakenListData.hook.tsx';
import { CalendarLink } from '../CalendarLink/CalendarLink.tsx';
import { LocationModal } from '../LocationModal/LocationModal.tsx';
import maLinkStyles from '../MaLink/MaLink.module.scss';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontendFinal;
  className?: string;
};

export function AfspraakCard({ afspraak, className }: AfspraakCardProps) {
  const isSmallScreen = useSmallScreen();
  const isLargeScreen = !isSmallScreen;

  const titleHeading = (
    // Make the heading text always take full space so the icon is always aligned with other items -
    // on small screens.
    <Heading level={3} className={styles.Heading}>
      {afspraak.subject}
    </Heading>
  );

  const cancellationLink = (
    <MaLink
      className={isSmallScreen ? styles.CancellationLink : ''}
      href={afspraak.cancellationLink}
    >
      Annuleren
    </MaLink>
  );

  const icon = <Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>;

  return (
    <Row className={className} gap="large">
      {isLargeScreen && icon}
      <Column
        className={
          isLargeScreen
            ? styles.ColumnLargeScreen /* Make sure `cancellationLink` is always aligned */
            : ''
        }
      >
        {isLargeScreen && titleHeading}
        {isSmallScreen && (
          <Row>
            {titleHeading}
            {icon}
          </Row>
        )}
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
        {/* The divs makes sure the links will not be displayed next to eachother. */}
        <div className="ams-mb-s">
          <CalendarLink
            icsData={{
              start: afspraak.startDate,
              end: afspraak.endDate,
              uid: afspraak.caseReference,
              summary: `Afspraak voor ${afspraak.subject}`,
              description: `Referentienummer: ${afspraak.caseReference}`,
              location: `Stadsloket ${afspraak.location.name}, ${afspraak.location.street}, ${afspraak.location.postalCode} ${afspraak.location.city}, Nederland`,
            }}
          >
            Voeg toe aan uw privé agenda
          </CalendarLink>
        </div>
        <div>
          <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
            <Button variant="secondary">Toon QR code</Button>
          </MaRouterLink>
        </div>
        {isSmallScreen && cancellationLink}
      </Column>
      {isLargeScreen && cancellationLink}
    </Row>
  );
}
