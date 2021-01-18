import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import InfoDetail from '../../InfoDetail/InfoDetail';
import Description from './Description';
import GenericBase, { GenericContent } from './GenericBase';
import Url from './Url';

interface MyArePanelContentSportProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentSport({
  datasetId,
  panelItem,
}: MyArePanelContentSportProps) {
  switch (datasetId) {
    case 'zwembad':
      return (
        <GenericBase title={panelItem.naam} supTitle="Zwembaden">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.telefoonnummer && (
            <Url
              label="Telefoonnummer"
              url={`tel:${panelItem.telefoonnummer}`}
              urlTitle={panelItem.telefoonnummer}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'sportpark':
      return (
        <GenericBase title={panelItem.omschrijving} supTitle="Sportparken" />
      );
    case 'sportveld':
      return (
        <GenericBase title={panelItem.sportfunctie} supTitle="Sportvelden">
          <InfoDetail
            label="Soort ondergrond"
            value={panelItem.soortOndergrond}
          />
          <InfoDetail label="Sportpark" value={panelItem.sportpark} />
        </GenericBase>
      );
    case 'gymzaal':
    case 'sportzaal':
      return (
        <GenericBase
          title={panelItem.naam}
          supTitle={datasetId === 'sportzaal' ? 'Sportzalen' : 'Gymzalen'}
        >
          {!!panelItem.omschrijving && (
            <Description description={panelItem.omschrijving} />
          )}
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.telefoonnummer && (
            <Url
              label="Telefoonnummer"
              url={`tel:${panelItem.telefoonnummer}`}
              urlTitle={panelItem.telefoonnummer}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
          {!!panelItem.bijzonderheden && (
            <InfoDetail
              label="Bijzonderheden"
              value={panelItem.bijzonderheden}
            />
          )}
        </GenericBase>
      );
    case 'sporthal':
      return (
        <GenericBase title={panelItem.naam} supTitle="Sporthallen">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.telefoonnummer && (
            <Url
              label="Telefoonnummer"
              url={`tel:${panelItem.telefoonnummer}`}
              urlTitle={panelItem.telefoonnummer}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'sportaanbieder':
      return (
        <GenericBase title={panelItem.naamAanbieder} supTitle="Sporten">
          {panelItem.naamSportfaciliteit &&
            panelItem.naamAanbieder !== panelItem.naamSportfaciliteit && (
              <InfoDetail
                label="Sportfaciliteit"
                value={panelItem.naamSportfaciliteit}
              />
            )}
          <InfoDetail label="Sport" value={panelItem.typeSport} />
          <InfoDetail label="Adres" value={panelItem.adres} />
          <InfoDetail
            label="Stadspasvergoeding jeugd"
            value={panelItem.indicatieStadspas || 'Nee'}
          />
          <InfoDetail
            label="Aangepast sporten"
            value={panelItem.indicatieAangepastSporten || 'Nee'}
          />
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'openbaresportplek':
      return (
        <GenericBase
          title={`${panelItem.sportvoorziening}`}
          supTitle="Openbare sportplekken"
        >
          {!!panelItem.naam && (
            <InfoDetail
              label="Locatie"
              value={capitalizeFirstLetter(panelItem.naam.toLowerCase())}
            />
          )}
          {!!panelItem.omschrijving && (
            <Description description={panelItem.omschrijving} />
          )}
          {!!panelItem.soortOndergrond && (
            <InfoDetail
              label="Soort ondergrond"
              value={panelItem.soortOndergrond}
            />
          )}
          {!!panelItem.soortLocatie && (
            <InfoDetail label="Soort locatie" value={panelItem.soortLocatie} />
          )}
        </GenericBase>
      );
    case 'hardlooproute':
      return (
        <GenericBase title={panelItem.naam} supTitle="Hardlooproutes">
          {/* <JsonString data={panelItem} /> */}
        </GenericBase>
      );
  }
  return <GenericContent datasetId={datasetId} panelItem={panelItem} />;
}
