import React from 'react';
import InfoDetail, { InfoDetailGroup } from '../InfoDetail/InfoDetail';
import { defaultDateFormat } from '../../../universal/helpers';
import Linkd from '../Button/Button';
import styles from './MyArea.module.scss';
import LoadingContent from '../LoadingContent/LoadingContent';

interface MyAreaPanelContentProps {
  panelItem: any;
}

export default function MyAreaPanelContent({
  panelItem,
}: MyAreaPanelContentProps) {
  if (!panelItem) {
    return <LoadingContent />;
  }

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

      {panelItem.dateStart && panelItem.dateEnd && (
        <>
          <InfoDetailGroup>
            <InfoDetail
              label={`Datum ${
                panelItem.dateStart !== panelItem.dateEnd ? 'van' : ''
              }`}
              value={defaultDateFormat(panelItem.dateStart)}
            />
            {panelItem.dateStart !== panelItem.dateEnd && (
              <InfoDetail
                label="Datum tot en met"
                value={defaultDateFormat(panelItem.dateStart)}
              />
            )}
          </InfoDetailGroup>
          {(panelItem.timeStart || panelItem.timeEnd) && (
            <InfoDetailGroup>
              {panelItem.timeStart && (
                <InfoDetail label="Tijd van" value={panelItem.timeStart} />
              )}
              {panelItem.timeEnd && (
                <InfoDetail label="Tijd tot" value={panelItem.timeEnd} />
              )}
            </InfoDetailGroup>
          )}
        </>
      )}
      {!!panelItem.description && (
        <InfoDetail
          className={styles.InfoDetailDescription}
          label="Beschrijving"
          value={panelItem.description}
        />
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
