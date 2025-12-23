import { Link, Paragraph } from '@amsterdam/design-system-react';

import { PageContentCell, PageV2 } from '../../components/Page/Page';

export function Burgerzaken() {
  return (
    <PageV2 heading="Paspoort en ID-kaart">
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
    </PageV2>
  );
}
