import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SIAItem } from '../../../server/services/sia';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Linkd,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './SiaDetail.module.scss';
import { LinkdInline } from '../../components/Button/Button';

function useSiaMeldingStatusLineItems(SiaItem?: SIAItem) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!SiaItem) {
      return [];
    }

    const isDone = SiaItem.status === 'Afgehandeld';
    return [
      {
        id: 'item-1',
        status: 'Ontvangen',
        datePublished: SiaItem.datePublished,
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
        isHighlight: false,
      },
      {
        id: 'item-2',
        status: 'In behandeling',
        datePublished: SiaItem.dateModified,
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
        isHighlight: !isDone,
      },
      {
        id: 'item-3',
        status: 'Afgehandeld',
        datePublished: SiaItem.dateClosed || '',
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
        isHighlight: isDone,
      },
    ];
  }, [SiaItem]);

  return statusLineItems;
}

export default function SiaDetail() {
  const { SIA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const SiaItem = SIA.content?.find((item) => item.identifier === id);
  const noContent = !isLoading(SIA) && !SiaItem;
  const statusLineItems = useSiaMeldingStatusLineItems(SiaItem);

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.SIA,
          title: ChapterTitles.SIA,
        }}
        isLoading={isLoading(SIA)}
      >
        Meldingsnummer {SiaItem?.identifier || ''}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(SIA) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(SIA) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!isLoading(SIA) && (
          <>
            <InfoDetailGroup>
              <InfoDetail
                label="Status"
                value={SiaItem?.status || 'Ontvangen'}
              />
              <InfoDetail
                label="Meldingsnummer"
                value={SiaItem?.identifier || '-'}
              />
            </InfoDetailGroup>
            <InfoDetail
              label="Omschrijving"
              value={SiaItem?.description || '-'}
            />
            <InfoDetailGroup>
              <InfoDetail
                label="Ontvangen op"
                value={
                  SiaItem?.datePublished
                    ? defaultDateFormat(SiaItem.datePublished)
                    : '-'
                }
              />
              <InfoDetail
                label="Datum overlast"
                value={
                  SiaItem?.dateSubject
                    ? defaultDateFormat(SiaItem.dateSubject)
                    : '-'
                }
              />
            </InfoDetailGroup>
            <InfoDetailGroup>
              <InfoDetail label="Categorie" value={SiaItem?.category || '-'} />
              <InfoDetail label="Locatie" value={SiaItem?.latlng || '-'} />
            </InfoDetailGroup>
            <InfoDetailGroup>
              <InfoDetail label="Email" value={SiaItem?.email || '-'} />
              <InfoDetail
                label="Telefoonnummer"
                value={SiaItem?.phone || '-'}
              />
            </InfoDetailGroup>
            <p className={styles.DetailInfo}>
              U heeft uw mailadres en telefoonnummer aan ons doorgegeven zodat
              wij u op de hoogte kunnen houden van de voortgang van uw melding.
              U kunt deze gegevens hier niet meer wijzigen. Over een jaar worden
              deze automatisch uit ons systeem verwijderd.
            </p>
            <p className={styles.DetailInfo}>
              Wilt u informatie toevoegen? Of is het probleem nog niet opgelost?
              <br />
              <LinkdInline
                external={true}
                href="https://meldingen.amsterdam.nl"
              >
                Maak een nieuwe melding
              </LinkdInline>
            </p>
            {!!SiaItem?.photos &&
              SiaItem?.photos.map((photo) => (
                <InfoDetail
                  label="Foto's"
                  value={<img src={photo} alt="Bijgevoegde foto" /> || '-'}
                />
              ))}
          </>
        )}
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.SiaStatus}
          trackCategory={`SiaMeldingen detail / status`}
          items={statusLineItems}
          showToggleMore={false}
          id={`sia-detail-${id}`}
        />
      )}
    </DetailPage>
  );
}
