import {
  Button,
  Column,
  Heading,
  Icon,
  Paragraph,
  Row,
} from '@amsterdam/design-system-react';

import { useSmallScreen } from '../../hooks/media.hook.ts';
import type { AfspraakFrontendFinal } from '../../pages/Thema/KlantContact/useAfsprakenListData.hook.tsx';
import { PersonAtDeskIcon } from '@amsterdam/design-system-react-icons';
import { MaLink, MaRouterLink } from '../MaLink/MaLink.tsx';
import { CalendarLink } from '../CalendarLink/CalendarLink.tsx';

type AfspraakCardProps = {
  afspraak: AfspraakFrontendFinal;
};

export function AfspraakCard({ afspraak }: AfspraakCardProps) {
  const isSmallScreen = useSmallScreen();
  const isLargeScreen = !isSmallScreen;

  const titleHeading = (
    // Make the heading text always take full space so the icon is always aligned with other items -
    // on small screens.
    <Heading level={3} style={{ width: '100%' }}>
      {afspraak.subject}
    </Heading>
  );

  const actionRightside = (
    <MaLink style={{ marginLeft: '50px' }} href={afspraak.cancellationLink}>
      Annuleren
    </MaLink>
  );

  const icon = <Icon svg={PersonAtDeskIcon} size="heading-2"></Icon>;

  return (
    <div
      key={afspraak.caseReference}
      className="ams-mb-m"
      style={{ paddingTop: '16px', borderTop: '2px solid #EEEEEE' }}
    >
      <Row gap="large">
        {isLargeScreen && icon}
        <Column
          style={{
            width: isSmallScreen
              ? ''
              : '800px' /* Make sure `actionRightside` is always aligned */,
          }}
        >
          {isLargeScreen && titleHeading}
          {isSmallScreen && (
            <Row>
              {titleHeading}
              {icon}
            </Row>
          )}
          <Paragraph>{afspraak.displayDate}</Paragraph>
          <Paragraph>{`Locatie Stadsloket ${afspraak.location.name}, ${afspraak.location.street}`}</Paragraph>
          <CalendarLink
            className={'ams-mb-s'}
            start={afspraak.startDate}
            end={afspraak.endDate}
            uid={afspraak.caseReference}
            summary={`Afspraak voor ${afspraak.subject}`}
            description={`Referentienummer: ${afspraak.caseReference}`}
            location={`Stadsloket ${afspraak.location.name}, ${afspraak.location.street}, ${afspraak.location.postalCode} ${afspraak.location.city}, Nederland`}
          >
            Voeg toe aan uw privé agenda
          </CalendarLink>
          <MaRouterLink maVariant="noUnderline" href={afspraak.qrCodeHref}>
            <Button variant="secondary">Toon QR code</Button>
          </MaRouterLink>
          {isSmallScreen && actionRightside}
        </Column>
        {isLargeScreen && actionRightside}
      </Row>
    </div>
  );
}
