import { Grid, Icon, Paragraph } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import { transformDetailsIntoRowSet } from './helpers';
import { useVarenThemaData } from './useVarenThemaData.hook';
import {
  exploitatieVergunningAanvragen,
  labelMapThemaRegistratieReder,
  varenMeerInformatieLink,
} from './Varen-thema-config';
import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { Datalist, RowSet } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';
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
  const {
    varenRederRegistratie,
    varenVergunningen,
    tableConfig,
    isLoading,
    isError,
  } = useVarenThemaData();

  const pageContentTopSecondary = (
    <MaButtonLink
      key={exploitatieVergunningAanvragen.to}
      href={exploitatieVergunningAanvragen.to}
      variant="secondary"
    >
      {exploitatieVergunningAanvragen.title}
      <Icon svg={ExternalLinkIcon} size="level-5" />
    </MaButtonLink>
  );

  const gegevensAanvragerRowSet: RowSet | null = varenRederRegistratie
    ? transformDetailsIntoRowSet(
        varenRederRegistratie,
        labelMapThemaRegistratieReder
      )
    : null;

  const gegevensAanvrager = gegevensAanvragerRowSet ? (
    <Grid.Cell span="all">
      <Datalist rows={[gegevensAanvragerRowSet]} />
    </Grid.Cell>
  ) : null;

  const vergunningenTables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, sort }]) => {
      return (
        <ThemaPaginaTable<VarenVergunningFrontend>
          key={kind}
          title={title}
          zaken={varenVergunningen.filter(filter).sort(sort)}
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
      pageContentTopSecondary={pageContentTopSecondary}
      pageContentMain={
        <>
          {gegevensAanvrager}
          {vergunningenTables}
        </>
      }
      isPartialError={false}
      linkListItems={[varenMeerInformatieLink]}
    />
  );
}
