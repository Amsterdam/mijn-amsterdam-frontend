import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { linkListItems } from '../Afis/Afis-thema-config';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';
import { tableConfig } from './config';
import {
  caseTypeVaren,
  VarenVergunningFrontend,
} from '../../../server/services/varen/config-and-types';
import { LinkProps } from '../../../universal/types/App.types';
import { Paragraph } from '@amsterdam/design-system-react';
import { GridDetails } from './GridDetails';

function useVarenThemaData() {
  const { VAREN } = useAppStateGetter();

  const gegevensAanvrager = VAREN.content?.find(
    (item) => item.caseType === caseTypeVaren.VarenRederRegistratie
  );

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
    <GridDetails
      caption={'Gegevens aanvrager'}
      displayProps={['email', 'company', 'adres', 'phone', 'bsnkvk']}
      items={gegevensAanvrager}
    />
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
