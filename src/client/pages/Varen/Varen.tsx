import { Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { buttonItems, linkListItems } from './Varen-thema-config';
import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { Datalist } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';
import { PageContentCell } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <PageContentCell>
    <Paragraph>
      De passagiersvaart in Amsterdam is erg populair bij bezoekers.
      Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook
      gehuurde boten, met of zonder schipper, vallen onder de passagiersvaart.
    </Paragraph>
  </PageContentCell>
);

export function Varen() {
  const {
    gegevensAanvrager,
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
  } = useVarenThemaData();

  const pageContentTopSecondary = (
    <>
      {buttonItems?.map(({ to, title }) => (
        <MaButtonLink key={to} href={to} variant="secondary">
          {title}
          <Icon svg={ExternalLinkIcon} size="level-5" />
        </MaButtonLink>
      ))}
    </>
  );

  const gegevensAanvragerList = gegevensAanvrager ? (
    <PageContentCell spanWide={12}>
      <Datalist rows={[gegevensAanvrager]} />
    </PageContentCell>
  ) : null;

  const vergunningenTables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={title}
          zaken={varenVergunningen.filter(filter).sort(sort)}
          displayProps={displayProps}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={ThemaTitles.VAREN}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={pageContentTop}
      pageContentTopSecondary={pageContentTopSecondary}
      pageContentMain={
        <>
          {gegevensAanvragerList}
          {vergunningenTables}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
    />
  );
}
