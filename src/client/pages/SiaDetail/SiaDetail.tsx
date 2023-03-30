import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { atom, RecoilState, useRecoilState } from 'recoil';
import {
  SiaAttachment,
  SIAItem,
  SiaSignalStatusHistory,
} from '../../../server/services/sia';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  apiPristineResult,
  ApiResponse,
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
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
import { TextClamp } from '../../components/InfoDetail/TextClamp';
import StatusLine from '../../components/StatusLine/StatusLine';
import { BFF_API_BASE_URL } from '../../config/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import { Location } from '../VergunningDetail/Location';
import styles from './SiaDetail.module.scss';

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

function getSiaMeldingStatusLineItems(
  SiaItem: SIAItem | undefined,
  history: ApiResponse<SiaSignalStatusHistory[]>
) {
  console.log('SiaItem:', SiaItem);
  if (!SiaItem) {
    return [];
  }

  // const isPending = SiaItem.status === 'Gemeld';
  // const isDone = SiaItem.status === 'Afgesloten';
  // const isInProgress = SiaItem.status === 'Ingepland';
  const statusLineItems = (history.content ?? []).map(
    (historyItem, index, all) => {
      return {
        id: 'item-' + historyItem.key,
        status: historyItem.status.split(':')[1],
        datePublished: historyItem.datePublished,
        description: historyItem.description,
        documents: [],
        isActive: index === all.length - 1,
        isChecked: true,
      };
    }
  );

  if (
    statusLineItems.length &&
    statusLineItems[statusLineItems.length - 1].status !== 'Afgehandeld'
  ) {
    statusLineItems.push({
      id: 'item-3',
      status: 'Afgehandeld',
      datePublished: '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
    });
  }

  return statusLineItems;
}

const statusHistoryAtom = atom<
  Record<string, ApiResponse<SiaSignalStatusHistory[]>>
>({
  key: 'siaStatusHistoryAtom',
  default: {},
});

const attachmentsAtom = atom<Record<string, ApiResponse<SiaAttachment[]>>>({
  key: 'siaAttachmentsAtom',
  default: {},
});

function useAdditionalDataById<T extends ApiResponse<any>>(
  id: string,
  url: string,
  atom: RecoilState<Record<string, T>>
): T {
  const [data, setData] = useRecoilState(atom);
  const isDataFetched = id in data;

  useEffect(() => {
    if (!isDataFetched) {
      fetch(url, {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          setData((data) => Object.assign({}, data, { [id]: responseJson }));
        });
    }
  }, [url, id, setData, isDataFetched]);

  return data[id] ?? apiPristineResult(null);
}

export default function SiaDetail() {
  const { SIA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const SiaItem = SIA.content?.find((item) => item.id === id);

  const attachments = useAdditionalDataById(
    id,
    `${BFF_API_BASE_URL}/services/signals/${id}/attachments`,
    attachmentsAtom
  );

  const history = useAdditionalDataById(
    id,
    `${BFF_API_BASE_URL}/services/signals/${id}/history`,
    statusHistoryAtom
  );

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
              value={
                <TextClamp maxHeight="20px">
                  {SiaItem.description || '-'}
                </TextClamp>
              }
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
                  label="Adres"
                  text={SiaItem.address}
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
            {!!attachments.content?.length && (
              <InfoDetail
                valueWrapperElement="div"
                label="Foto's"
                value={
                  <div className={styles.Images}>
                    {attachments.content.map((attachment, index) => (
                      <a
                        href={attachment.url}
                        key={index}
                        className={styles.ImgContainer}
                      >
                        <img
                          className={styles.Img}
                          src={attachment.url}
                          alt="Bijgevoegde foto"
                        />
                      </a>
                    ))}
                  </div>
                }
              />
            )}
            {attachments.status === 'ERROR' && (
              <Alert type="warning">
                <p>We kunnen op dit moment geen bijlages laten zien.</p>
              </Alert>
            )}
          </>
        )}
      </PageContent>

      {history.status === 'ERROR' && (
        <Alert type="warning">
          <p>We kunnen op dit moment geen volledige historie laten zien.</p>
        </Alert>
      )}

      {!isLoading(SIA) && !!SiaItem && (
        <StatusLine
          className={styles.SiaStatus}
          trackCategory="SiaMeldingen detail / status"
          items={getSiaMeldingStatusLineItems(SiaItem, history)}
          showToggleMore={false}
          id={`sia-detail-${id}`}
        />
      )}
    </DetailPage>
  );
}
