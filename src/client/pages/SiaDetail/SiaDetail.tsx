import axios from 'axios';
import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { RecoilState, atom, useRecoilState } from 'recoil';
import {
  SIAItem,
  SiaAttachment,
  SiaSignalStatusHistory,
} from '../../../server/services/sia';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  ApiResponse,
  apiPristineResult,
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  ErrorAlert,
  ThemaIcon,
  DetailPage,
  DocumentList,
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

function getSiaMeldingStatusLineItems(
  SiaItem: SIAItem | undefined,
  history: ApiResponse<SiaSignalStatusHistory[]>
) {
  if (!SiaItem) {
    return [];
  }

  const statusLineItems = (history.content ?? []).map(
    (historyItem, index, all) => {
      return {
        id: 'item-' + historyItem.key,
        status: historyItem.status,
        datePublished: historyItem.datePublished,
        description: historyItem.description,
        documents: [],
        isActive: index === all.length - 1,
        isChecked: true,
      };
    }
  );

  // Add "dummy" statuses so we can show a process flow.
  if (!statusLineItems.length) {
    statusLineItems.push({
      id: 'item-1',
      status: 'Open',
      datePublished: SiaItem.datePublished,
      description: '',
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }
  if (
    statusLineItems.length &&
    statusLineItems[statusLineItems.length - 1].status !== 'Afgesloten'
  ) {
    statusLineItems.push({
      id: 'item-3',
      status: 'Afgesloten',
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
  url: string,
  atom: RecoilState<Record<string, T>>,
  id?: string
): T {
  const [data, setData] = useRecoilState(atom);
  const isDataFetched = !!id && id in data;

  useEffect(() => {
    if (!isDataFetched && id) {
      axios
        .get(url, {
          withCredentials: true,
          responseType: 'json',
        })
        .then((responseJson) => {
          setData((data) =>
            Object.assign({}, data, { [id]: responseJson.data })
          );
        });
    }
  }, [url, id, setData, isDataFetched]);

  if (id && isDataFetched) {
    return data[id];
  }

  return apiPristineResult(null) as T;
}

export default function SiaDetail() {
  const { SIA } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const allSiaItems = [
    ...(SIA.content?.open?.items ?? []),
    ...(SIA.content?.afgesloten?.items ?? []),
  ];
  const SiaItem = allSiaItems.find((item) => item.identifier === id);

  const attachments = useAdditionalDataById(
    `${BFF_API_BASE_URL}/services/signals/${SiaItem?.id}/attachments`,
    attachmentsAtom,
    SiaItem?.id
  );

  const history = useAdditionalDataById(
    `${BFF_API_BASE_URL}/services/signals/${SiaItem?.id}/history`,
    statusHistoryAtom,
    SiaItem?.id
  );

  const imageAttachments =
    attachments.content?.filter((attachment) => attachment.isImage) ?? [];
  const otherAttachments =
    attachments.content?.filter((attachment) => !attachment.isImage) ?? [];

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: AppRoutes.ROOT,
          title: ChapterTitles.SIA,
        }}
        isLoading={isLoading(SIA)}
      >
        Meldingsnummer {SiaItem?.identifier || ''}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {isError(SIA) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
        {!isLoading(SIA) && !SiaItem && (
          <ErrorAlert severityInput="info">
            We kunnen dit item niet vinden.
          </ErrorAlert>
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
              label="Categorie"
              value={SiaItem.category || '-'}
            />
            <InfoDetail
              className={styles.NoPadding}
              label="Omschrijving"
              value={
                <TextClamp tagName="span">
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
                  trackPageViewTitle={`Locatie Popup | Melding open ${SiaItem.identifier}`}
                  trackPageViewUrl={`${location.pathname}/locatie-popup`}
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

            <InfoDetailGroup>
              <InfoDetail label="E-mail melder" value={SiaItem.email || '-'} />
              <InfoDetail label="Telefoonnummer" value={SiaItem.phone || '-'} />
            </InfoDetailGroup>

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
            {!!imageAttachments.length && (
              <InfoDetail
                valueWrapperElement="div"
                label="Foto's"
                className={styles.ImageDetails}
                value={
                  <div className={styles.Images}>
                    {imageAttachments.map((attachment, index) => (
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
            {!!otherAttachments.length && (
              <InfoDetail
                valueWrapperElement="div"
                label="Overige bijlages"
                className={styles.ImageDetails}
                value={
                  <DocumentList
                    documents={otherAttachments.map((attachment, i) => {
                      return {
                        title: `${attachment.url
                          .split('?')[0]
                          .split('.')
                          .pop()
                          ?.toLocaleUpperCase()} Bijlage`,
                        url: attachment.url,
                        id: `${i}`,
                        datePublished: SiaItem.datePublished,
                        external: true,
                      };
                    })}
                  />
                }
              />
            )}
            {attachments.status === 'ERROR' && (
              <ErrorAlert>
                We kunnen op dit moment geen bijlages laten zien.
              </ErrorAlert>
            )}
          </>
        )}
        {history.status === 'ERROR' && (
          <ErrorAlert>
            We kunnen op dit moment niet alle status informatie laten zien.
          </ErrorAlert>
        )}
      </PageContent>

      {!isLoading(SIA) && !!SiaItem && (
        <StatusLine
          className={styles.SiaStatus}
          trackCategory="SiaMeldingen detail / status"
          items={getSiaMeldingStatusLineItems(SiaItem, history)}
          id={`sia-detail-${id}`}
        />
      )}
    </DetailPage>
  );
}
