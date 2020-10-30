import React from 'react';
import InfoDetail from '../../InfoDetail/InfoDetail';
import Date from './Date';
import DateStartEnd from './DateStartEnd';
import Description from './Description';
import Url from './Url';

interface MyArePanelContentBekendmakingProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentBekendmaking({
  datasetId,
  panelItem,
}: MyArePanelContentBekendmakingProps) {
  // 'apv vergunning',
  // 'evenementenvergunning',
  // 'exploitatievergunning',
  // 'inspraak',
  // 'kapvergunning',
  // 'ligplaatsvergunning',
  // 'meldingen',
  // 'omgevingsvergunning',
  // 'onttrekkingsvergunning',
  // 'openingstijden',
  // 'rectificatie',
  // 'speelautomaten',
  // 'splitsingsvergunning',
  // 'terrasvergunning',
  // 'verkeersbesluit',
  // 'overig',
  // 'geluidvergunning',
  // 'bestemmingsplan',
  // 'drank- en horecavergunning',
  return (
    <>
      {!!panelItem.datePublished && <Date date={panelItem.datePublished} />}
      {!!panelItem.category && (
        <InfoDetail label="Categorie" value={panelItem.category} />
      )}
      {!!panelItem.subject && (
        <InfoDetail label="Onderwerp" value={panelItem.subject} />
      )}

      {panelItem.dateStart && panelItem.dateEnd && (
        <DateStartEnd
          dateStart={panelItem.dateStart}
          dateEnd={panelItem.dateEnd}
          timeStart={panelItem.timeStart}
          timeEnd={panelItem.timeEnd}
        />
      )}
      {!!panelItem.description && (
        <Description description={panelItem.description} />
      )}
      {!!panelItem.url && <Url url={panelItem.url} />}
    </>
  );
}
