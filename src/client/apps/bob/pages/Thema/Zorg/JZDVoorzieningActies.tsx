import { Heading, Paragraph } from '@amsterdam/design-system-react';

import { isVoorzieningActieAvailable } from './Zorg-helpers.ts';
import { themaConfig } from './Zorg-thema-config.ts';
import type { WMOVoorzieningFrontend } from '../../../../../../server/services/jzd/wmo/wmo-types.ts';
import {
  MaButtonLink,
  MaLink,
} from '../../../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';

type JZDVoorzieningActiesProps = {
  voorziening: WMOVoorzieningFrontend;
};

export function JZDVoorzieningActies({
  voorziening,
}: JZDVoorzieningActiesProps) {
  const isReparatieverzoekAvailable = isVoorzieningActieAvailable(
    voorziening,
    'reparatieverzoek'
  );
  const isPGBReparatieverzoek = isVoorzieningActieAvailable(
    voorziening,
    'pgb-reparatieverzoek',
    false
  );
  const isStopzettenAvailable = isVoorzieningActieAvailable(
    voorziening,
    'stopzetten'
  );
  const isStopzettenNietViaFormulierAvailable = isVoorzieningActieAvailable(
    voorziening,
    'stopzetten-niet-via-formulier',
    false
  );

  return (
    <>
      {(isReparatieverzoekAvailable || isPGBReparatieverzoek) && (
        <PageContentCell spanWide={7}>
          {isReparatieverzoekAvailable && (
            <>
              <Heading level={4} size="level-4">
                Reparatieverzoek aanvragen
              </Heading>
              <Paragraph className="ams-mb-m">
                U kunt een reparatie verzoek voor deze voorziening aanvragen
                door het reparatieverzoek formulier in te vullen.
              </Paragraph>
              <MaButtonLink
                href={voorziening?.maActieUrls?.reparatieverzoek}
                rel="noopener noreferrer"
              >
                Reparatieverzoek indienen
              </MaButtonLink>
            </>
          )}
          {isPGBReparatieverzoek && (
            <>
              <Heading level={4} size="level-4">
                Reparatieverzoek aanvragen
              </Heading>
              <Paragraph>
                Heeft u de woningaanpassing met een pgb aangeschaft? Dan moet u
                zelf de kosten voor reparatie en onderhoud betalen met uw pgb.
                Bij uw pgb is hiervoor een bedrag inbegrepen.
              </Paragraph>
            </>
          )}
        </PageContentCell>
      )}

      {themaConfig.featureToggle.stopzetten.active && isStopzettenAvailable && (
        <PageContentCell spanWide={7}>
          <Heading level={4} size="level-4">
            Voorziening stopzetten
          </Heading>
          <Paragraph>
            U kunt deze voorziening via dit{' '}
            <MaLink
              href={voorziening?.maActieUrls?.stopzetten}
              rel="noopener noreferrer"
            >
              formulier
            </MaLink>{' '}
            stopzetten. Na nadat u de voorziening heeft stop gezet ontvang u
            hier van bericht.
          </Paragraph>
        </PageContentCell>
      )}
      {themaConfig.featureToggle.stopzetten.active &&
        isStopzettenNietViaFormulierAvailable && (
          <PageContentCell spanWide={7}>
            <Heading level={4} size="level-4">
              Voorziening stopzetten
            </Heading>
            <Paragraph>
              Wilt u deze voorziening stopzetten neem dan contact op met{' '}
              {voorziening.supplier} met het verzoek deze voorziening stop te
              zetten. Deze geeft aan de gemeente door dat de voorziening door u
              is stopgezet. Het stopzetten duurt ongeveer 2 weken. U krijgt
              altijd een bevestiging van de inname. De contact gegevens van{' '}
              {voorziening.supplier} vindt u bij{' '}
              <MaLink
                href="https://www.amsterdam.nl/zorg-en-ondersteuning/"
                rel="noopener noreferrer"
              >
                zorg en ondersteuning
              </MaLink>{' '}
              op amsterdam.nl. Als u een wijziging doorvoert kan het enige tijd
              duren voordat deze in dit overzicht zichtbaar is in Mijn
              Amsterdam.
            </Paragraph>
          </PageContentCell>
        )}
    </>
  );
}
