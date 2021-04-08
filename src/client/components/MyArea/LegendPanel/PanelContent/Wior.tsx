import { InfoDetail } from '../../..';
import GenericBase from './GenericBase';
import JsonString from './JsonString';
import Url from './Url';
import DateStartEnd from './DateStartEnd';

interface MyArePanelContentWIORProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentWIOR({
  datasetId,
  panelItem,
}: MyArePanelContentWIORProps) {
  return (
    <GenericBase
      title={panelItem.wiorNummer}
      supTitle="Werk in de openbare ruimte (WIOR)"
    >
      {!!panelItem.projectnaam && (
        <InfoDetail label="Projectnaam" value={panelItem.projectnaam} />
      )}
      {!!panelItem.beschrijving && (
        <InfoDetail label="Werkzaamheden" value={panelItem.beschrijving} />
      )}
      {!!panelItem.datumStartUitvoering && panelItem.datumEindeUitvoering && (
        <DateStartEnd
          label="Geplande uitvoering"
          dateStart={panelItem.datumStartUitvoering}
          dateEnd={panelItem.datumEindeUitvoering}
        />
      )}
      {!!panelItem.typeWerkzaamheden && (
        <InfoDetail
          label="Soort werkzaamheden"
          value={panelItem.typeWerkzaamheden}
        />
      )}
      {!!panelItem.indicatieKleinwerk && (
        <InfoDetail
          label="Kleine klus"
          value={
            panelItem.indicatieKleinwerk === 'Yes'
              ? 'Ja'
              : panelItem.indicatieKleinwerk
          }
        />
      )}
    </GenericBase>
  );
}
