import GenericBase, { GenericContent } from './GenericBase.tsx';
import Url from './Url.tsx';
import { capitalizeFirstLetter } from '../../../../../universal/helpers/text.ts';
import { Unshaped } from '../../../../../universal/types/App.types.ts';
import { parseHTML } from '../../../../helpers/html-react-parse.tsx';
import { Datalist } from '../../../Datalist/Datalist.tsx';

interface MyArePanelContentSportProps {
  panelItem: Unshaped;
  datasetId: string;
}

export default function MyArePanelContentSport({
  datasetId,
  panelItem,
}: MyArePanelContentSportProps) {
  switch (datasetId) {
    case 'sporthal':
    case 'zwembad':
      return (
        <GenericBase
          title={panelItem.naam}
          supTitle={datasetId === 'sporthal' ? 'Sporthallen' : 'Zwembaden'}
        >
          <Datalist
            rows={[
              { label: 'Adres', content: panelItem.adres },
              {
                label: 'E-mail',
                content: (
                  <Url
                    url={`mailto:${panelItem.emailadres}`}
                    urlTitle={panelItem.emailadres}
                  />
                ),
              },
              {
                label: 'Telefoonnummer',
                content: (
                  <Url
                    url={`tel:${panelItem.telefoonnummer}`}
                    urlTitle={panelItem.telefoonnummer}
                  />
                ),
              },
              { label: 'Website', content: <Url url={panelItem.website} /> },
            ]}
          />
        </GenericBase>
      );
    case 'sportpark':
      return (
        <GenericBase title={panelItem.omschrijving} supTitle="Sportparken" />
      );
    case 'sportveld':
      return (
        <GenericBase title={panelItem.sportfunctie} supTitle="Sportvelden">
          <Datalist
            rows={[
              { label: 'Soort ondergrond', content: panelItem.soortOndergrond },
              {
                label: 'Sportpark',
                content: panelItem.sportpark,
              },
            ]}
          />
        </GenericBase>
      );
    case 'gymzaal':
    case 'sportzaal':
      return (
        <GenericBase
          title={panelItem.naam}
          supTitle={datasetId === 'sportzaal' ? 'Sportzalen' : 'Gymzalen'}
        >
          <Datalist
            rows={[
              {
                label: 'Omschrijving',
                content: parseHTML(panelItem.omschrijving),
              },
              { label: 'Adres', content: panelItem.adres },
              {
                label: 'E-mail',
                content: (
                  <Url
                    url={`mailto:${panelItem.emailadres}`}
                    urlTitle={panelItem.emailadres}
                  />
                ),
                isVisible: !!panelItem.emailadres,
              },
              {
                label: 'Telefoonnummer',
                content: (
                  <Url
                    url={`tel:${panelItem.telefoonnummer}`}
                    urlTitle={panelItem.telefoonnummer}
                  />
                ),
                isVisible: !!panelItem.telefoonnummer,
              },
              {
                label: 'Website',
                content: <Url url={panelItem.website} />,
                isVisible: !!panelItem.website,
              },
              {
                label: 'Bijzonderheden',
                content: panelItem.bijzonderheden,
                isVisible: !!panelItem.bijzonderheden,
              },
            ]}
          />
        </GenericBase>
      );
    case 'sportaanbieder':
      return (
        <GenericBase title={panelItem.naamAanbieder} supTitle="Sporten">
          <Datalist
            rows={[
              {
                label: 'Sportfaciliteit',
                content: panelItem.naamSportfaciliteit,
                isVisible: !!(
                  panelItem.naamAanbieder !== panelItem.naamSportfaciliteit &&
                  panelItem.naamSportfaciliteit
                ),
              },
              {
                label: 'Sport',
                content: panelItem.typeSport,
              },
              {
                label: 'Adres',
                content: panelItem.adres,
                isVisible: !!panelItem.adres,
              },
              {
                label: 'Stadspasvergoeding jeugd',
                content: panelItem.stadspasJeugd ? 'Ja' : 'Nee',
              },
              {
                label: 'Aangepast sporten',
                content: panelItem.aangepastSporten === 'True' ? 'Ja' : 'Nee',
              },
              {
                label: 'Website',
                content: <Url url={panelItem.website} />,
                isVisible: !!panelItem.website,
              },
            ]}
          />
        </GenericBase>
      );
    case 'openbaresportplek':
      return (
        <GenericBase
          title={`${panelItem.sportvoorziening}`}
          supTitle="Openbare sportplekken"
        >
          <Datalist
            rows={[
              {
                label: 'Locatie',
                content: capitalizeFirstLetter(panelItem.naam.toLowerCase()),
                isVisible: !!panelItem.naam,
              },
              {
                label: 'Omschrijving',
                content: parseHTML(panelItem.omschrijving),
                isVisible: !!panelItem.omschrijving,
              },
              {
                label: 'Soort locatie',
                content: panelItem.soortLocatie,
                isVisible: !!panelItem.soortLocatie,
              },
              {
                label: 'Soort ondergrond',
                content: panelItem.soortOndergrond,
                isVisible: !!panelItem.soortOndergrond,
              },
            ]}
          />
        </GenericBase>
      );
    case 'hardlooproute':
      return (
        <GenericBase title={panelItem.naam} supTitle="Hardlooproutes">
          <Datalist
            rows={[
              {
                label: 'Lengte',
                content: panelItem.lengte + ' km',
                isVisible: !!panelItem.lengte,
              },
            ]}
          />
        </GenericBase>
      );
  }
  return <GenericContent datasetId={datasetId} panelItem={panelItem} />;
}
