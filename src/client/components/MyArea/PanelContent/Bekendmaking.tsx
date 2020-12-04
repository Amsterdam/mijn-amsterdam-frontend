import React from 'react';
import InfoDetail from '../../InfoDetail/InfoDetail';
import Date from './Date';
import Description from './Description';
import GenericBase from './GenericBase';
import Url from './Url';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';

interface MyArePanelContentBekendmakingProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentBekendmaking({
  datasetId,
  panelItem,
}: MyArePanelContentBekendmakingProps) {
  return (
    <GenericBase
      title={capitalizeFirstLetter(panelItem.onderwerp)}
      supTitle="Bekendmakingen"
    >
      {!!panelItem.datePublished && <Date date={panelItem.datePublished} />}
      {!!panelItem.categorie && (
        <InfoDetail label="Categorie" value={panelItem.categorie} />
      )}
      {!!panelItem.datumTijdstip && <Date date={panelItem.datumTijdstip} />}

      {!!panelItem.beschrijving && (
        <Description description={panelItem.beschrijving} />
      )}
      {!!panelItem.url && <Url url={panelItem.url} />}
    </GenericBase>
  );
}
