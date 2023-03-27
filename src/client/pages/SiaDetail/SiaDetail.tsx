import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SiaAttachment, SIAItem } from '../../../server/services/sia';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { formatDurationInWords } from '../../../universal/helpers/date';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './SiaDetail.module.scss';
import { Location } from '../VergunningDetail/Location';
import { BFF_API_BASE_URL } from '../../config/api';

// Gemeld
// In afwachting van behandeling
// In behandeling
// On hold
// Ingepland
// Afgehandeld
// Geannuleerd
// Heropend
// Extern: verzoek tot afhandeling
// Reactie gevraagd
// Reactie ontvangen
// Doorgezet naar extern

function useSiaMeldingStatusLineItems(SiaItem?: SIAItem) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!SiaItem) {
      return [];
    }

    const isPending = SiaItem.status === 'Gemeld';
    const isDone = SiaItem.status === 'Afgesloten';
    const isInProgress = SiaItem.status === 'Ingepland';
    return [
      {
        id: 'item-1',
        status: 'Gemeld',
        datePublished: SiaItem.datePublished,
        description: '',
        documents: [],
        isActive: isPending,
        isChecked: true,
      },
      {
        id: 'item-2',
        status: 'Ingepland',
        datePublished:
          isInProgress && !isDone && SiaItem.dateModified
            ? SiaItem.dateModified
            : '',
        description: '',
        documents: [],
        isActive: isInProgress,
        isChecked: isDone || isInProgress,
      },
      {
        id: 'item-3',
        status: 'Afgesloten',
        datePublished: isDone ? SiaItem.dateClosed || '' : '',
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
      },
    ];
  }, [SiaItem]);

  return statusLineItems;
}

export default function SiaDetail() {
  const { SIA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const SiaItem = SIA.content?.find((item) => item.id === id);
  const statusLineItems = useSiaMeldingStatusLineItems(SiaItem);

  const [attachments, setAttachments] = useState<SiaAttachment[]>([]);

  useEffect(() => {
    if (!!SiaItem?.hasAttachments) {
      fetch(`${BFF_API_BASE_URL}/services/signals/${SiaItem.id}/attachments`, {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          setAttachments(responseJson);
        });
    }
  }, [SiaItem]);

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
        {isError(SIA) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(SIA) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!isLoading(SIA) && !!SiaItem && (
          <>
            <InfoDetailGroup>
              <InfoDetail
                label="Status"
                value={SiaItem.status || 'Ontvangen'}
              />
              <InfoDetail
                label="Meldingsnummer"
                value={SiaItem.identifier || '-'}
              />
            </InfoDetailGroup>
            <InfoDetail
              className={styles.NoPadding}
              label="Omschrijving"
              value={SiaItem.description || '-'}
            />
            <InfoDetailGroup>
              <InfoDetail
                label="Ontvangen op"
                value={
                  SiaItem.datePublished
                    ? defaultDateFormat(SiaItem.datePublished)
                    : '-'
                }
              />
              <InfoDetail
                label="Datum overlast"
                value={
                  <>
                    {SiaItem.dateIncidentStart &&
                      defaultDateFormat(SiaItem.dateIncidentStart)}
                    {SiaItem.dateIncidentEnd && (
                      <> &mdash; {defaultDateFormat(SiaItem.dateIncidentEnd)}</>
                    )}
                  </>
                }
              />
            </InfoDetailGroup>
            <InfoDetailGroup>
              {!!SiaItem.latlon && (
                <Location
                  modalTitle="Locatie van de melding"
                  latlng={SiaItem.latlon}
                  label={SiaItem.address}
                />
              )}
              <InfoDetail
                label="Verwerkingstijd"
                className={styles.NoPadding}
                value={
                  <>
                    We laten u binnen 5 dagen weten wat we hebben gedaan. En
                    anders hoort u wanneer wij uw melding kunnen oppakken. We
                    houden u op de hoogte.
                  </>
                }
              />
            </InfoDetailGroup>
            {/* <InfoDetailGroup>
              <InfoDetail label="Urgentie" value={SiaItem.priority} />
              {SiaItem.deadline && (
                <InfoDetail
                  label="Verwerkingstijd"
                  value={formatDurationInWords(SiaItem.deadline)}
                />
              )}
            </InfoDetailGroup> */}
            <InfoDetailGroup>
              <InfoDetail label="E-mail melder" value={SiaItem.email || '-'} />
              <InfoDetail label="Telefoonnummer" value={SiaItem.phone || '-'} />
            </InfoDetailGroup>

            <p className={styles.DetailInfo}>
              U hebt uw mailadres en telefoonnummer doorgegeven zodat u op de
              hoogte wordt gehouden over de voortgang van uw melding. U kunt
              deze gegevens hier niet meer wijzigen. 12 maanden na ontvangst van
              uw melding worden deze gegevens automatisch verwijderd uit ons
              systeem.
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
            {!!attachments.length && (
              <InfoDetail
                valueWrapperElement="div"
                label="Foto's"
                value={
                  <div className={styles.Images}>
                    {attachments.map((attachment, index) => (
                      <div key={index} className={styles.ImgContainer}>
                        <img
                          className={styles.Img}
                          src={attachment.url}
                          alt="Bijgevoegde foto"
                        />
                      </div>
                    ))}
                  </div>
                }
              />
            )}
          </>
        )}
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.SiaStatus}
          trackCategory="SiaMeldingen detail / status"
          items={statusLineItems}
          showToggleMore={false}
          id={`sia-detail-${id}`}
        />
      )}
    </DetailPage>
  );
}
