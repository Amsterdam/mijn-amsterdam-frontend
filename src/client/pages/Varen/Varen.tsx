import { Grid, Paragraph } from '@amsterdam/design-system-react';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { buttonItems, linkListItems } from './Varen-thema-config';
import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { Datalist } from '../../components/Datalist/Datalist';
import { ThemaTitles } from '../../config/thema';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

const pageContentTop = (
  <Paragraph>
    De passagiersvaart in Amsterdam is erg populair bij bezoekers.
    Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook gehuurde
    boten, met of zonder schipper, vallen onder de passagiersvaart.
  </Paragraph>
);

export function Varen() {
  const { gegevensAanvrager, tableItems, tableConfig, isLoading, isError } =
    useVarenThemaData();

  const gegevens = gegevensAanvrager ? (
    <Grid.Cell span="all">
      <Datalist rows={[gegevensAanvrager]} />
    </Grid.Cell>
  ) : null;

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={title}
          zaken={tableItems.filter(filter).sort(sort)}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
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
      pageContentMain={
        <>
          {gegevens}
          {tables}
        </>
      }
      isPartialError={false}
      linkListItems={linkListItems}
      buttonItems={buttonItems}
    />
  );
}
