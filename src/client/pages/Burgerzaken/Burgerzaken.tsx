import { Link, Paragraph } from '@amsterdam/design-system-react';

import {
  TextPageV2,
  PageContentV2,
  PageContentCell,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

export function Burgerzaken() {
  return (
    <TextPageV2>
      <PageContentV2 span={8}>
        <PageHeadingV2>Paspoort en ID-kaart</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb-m">
            U kunt uw paspoort of ID-kaart niet meer bekijken in Mijn Amsterdam.
            <br />
            Ga naar{' '}
            <Link
              rel="noopener noreferrer"
              href="https://mijn.overheid.nl/identiteit/persoonsgegevens/reisdocumenten"
            >
              MijnOverheid
            </Link>{' '}
            om gegevens van uw paspoort of ID-kaart te zien.
          </Paragraph>
          <Paragraph>
            Op{' '}
            <Link
              rel="noopener noreferrer"
              href="https://www.amsterdam.nl/burgerzaken/paspoort-id-kaart-rijbewijs/"
            >
              Paspoort en ID-kaart
            </Link>{' '}
            leest u meer over deze reisdocumenten.
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
