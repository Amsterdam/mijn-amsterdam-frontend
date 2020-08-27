import React from 'react';
import InfoDetail from '../InfoDetail/InfoDetail';
import { defaultDateFormat } from '../../../universal/helpers';
import Linkd from '../Button/Button';

interface MyAreaPanelContentProps {
  panelItem: any;
}

export default function MyAreaPanelContent({
  panelItem,
}: MyAreaPanelContentProps) {
  return (
    <div>
      {!!panelItem.datePublished && (
        <InfoDetail
          label="Datum"
          value={defaultDateFormat(panelItem.datePublished)}
        />
      )}
      {!!panelItem.category && (
        <InfoDetail label="Categorie" value={panelItem.category} />
      )}
      {!!panelItem.subject && (
        <InfoDetail label="Onderwerp" value={panelItem.subject} />
      )}
      {!!panelItem.description && (
        <InfoDetail label="Beschrijving" value={panelItem.description} />
      )}
      {!!panelItem.url && (
        <InfoDetail
          label="Meer informatie"
          value={
            <Linkd external={true} href={panelItem.url}>
              {panelItem.url}
            </Linkd>
          }
        />
      )}
    </div>
  );
}
