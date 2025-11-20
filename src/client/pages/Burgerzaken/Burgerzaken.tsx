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
        <PageHeadingV2>Paspoort en ID-Kaart</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb-m">
            Het is in Mijn Amsterdam helaas niet meer mogelijk om uw paspoort of
            ID-kaart in te zien.
          </Paragraph>
          <Paragraph>
            Voor meer informatie over uw paspoort of ID-kaart{' '}
            <Link href="https://www.amsterdam.nl/burgerzaken/paspoort-id-kaart-rijbewijs/">
              gaat u naar de pagina op Amsterdam.nl
            </Link>
            .
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
