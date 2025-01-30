import { Grid, Paragraph } from '@amsterdam/design-system-react';

import { tableConfig } from './config';
import {
  caseTypeVaren,
  VarenVergunningFrontend,
} from '../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { LinkProps } from '../../../universal/types/App.types';
import { Datalist } from '../../components/Datalist/Datalist';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { linkListItems } from '../Afis/Afis-thema-config';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const varenRederRegistratie = VAREN.content?.find(
    (item) => item.caseType === caseTypeVaren.VarenRederRegistratie
  );

  const span = { narrow: 4, medium: 4, wide: 3 };
  const col1start = { narrow: 1, medium: 1, wide: 1 };
  const col2start = { narrow: 1, medium: 5, wide: 4 };
  const col3start = { narrow: 1, medium: 1, wide: 8 };

  const gegevensAanvrager = varenRederRegistratie
    ? [
        {
          rows: [
            {
              label: 'Bedrijfsnaam',
              content: varenRederRegistratie.company,
              start: col1start,
              span,
            },
            {
              label: 'E-mailadres',
              content: varenRederRegistratie.email,
              start: col2start,
              span,
            },
            {
              label: 'Telefoonnummer',
              content: varenRederRegistratie.phone,
              start: col3start,
              span,
            },
            {
              label: 'KVK nummer',
              content: varenRederRegistratie.bsnkvk,
              start: col1start,
              span,
            },
            {
              label: 'Adres',
              content: varenRederRegistratie.adres,
              start: col2start,
              span,
            },
          ],
        },
      ]
    : null;

  const vergunningen = VAREN.content?.filter(
    (item) => item.caseType !== caseTypeVaren.VarenRederRegistratie
  );

  const tableItems = addLinkElementToProperty<VarenVergunningFrontend>(
    vergunningen ?? [],
    'vesselName',
    true
  );

  return {
    gegevensAanvrager,
    tableConfig,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    tableItems,
    linkListItems,
  };
}

export default function Varen() {
  const { gegevensAanvrager, tableItems, tableConfig, isLoading, isError } =
    useVarenThemaData();

  const pageContentTop = (
    <Paragraph>
      De passagiersvaart in Amsterdam is erg populair bij bezoekers.
      Rondvaartboten en salonboten zijn een vorm van passagiersvaart. Ook
      gehuurde boten, met of zonder schipper, vallen onder de passagiersvaart.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
      title: 'Meer informatie over passagiers- en beroepsvaart',
    },
  ];

  const buttonItems: LinkProps[] = [
    {
      to: 'https://formulieren.acc.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/VARExploitatievergunningAanvragen.aspx',
      title: 'Exploitatievergunning aanvragen',
    },
  ];

  const gegevens = (
    <Grid.Cell span="all">
      <Datalist rows={gegevensAanvrager} />
    </Grid.Cell>
  );

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
