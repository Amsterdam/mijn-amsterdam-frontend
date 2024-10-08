import styles from './ToeristischeVerhuurDetail.module.scss';
import { BBVergunning } from '../../../server/services/toeristische-verhuur/bb-vergunning';
import { VakantieverhuurVergunning } from '../../../server/services/toeristische-verhuur/vakantieverhuur-vergunning';
import { VakantieverhuurVergunning as VakantieverhuurVergunningDecos } from '../../../server/services/vergunningen/vergunningen';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { DocumentList, LinkdInline, PageContent } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine from '../../components/StatusLine/StatusLine';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import { Location } from '../VergunningDetail/Location';

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning: VakantieverhuurVergunning | BBVergunning;
}) {
  const isVakantieVerhuur = vergunning.titel === 'Vergunning vakantieverhuur';

  return (
    <>
      <PageContent className={styles.DetailPageContent}>
        {isVakantieVerhuur && (
          <p>
            Vakantieverhuur kunt u melden en annuleren via{' '}
            <LinkdInline
              external={true}
              href="https://www.toeristischeverhuur.nl/portaal/login"
            >
              toeristischeverhuur.nl
            </LinkdInline>
            .
          </p>
        )}
        <InfoDetail
          label="Gemeentelijk zaaknummer"
          value={vergunning?.zaaknummer ?? '-'}
        />
        {(vergunning.datumVan || vergunning.datumTot) && (
          <InfoDetailGroup>
            <InfoDetail
              label="Vanaf"
              value={
                vergunning.datumVan
                  ? defaultDateFormat(vergunning.datumVan)
                  : '-'
              }
            />
            <InfoDetail
              label="Tot"
              value={
                vergunning.datumTot
                  ? defaultDateFormat(vergunning.datumTot)
                  : '-'
              }
            />
          </InfoDetailGroup>
        )}
        {vergunning.titel === 'Vergunning bed & breakfast' &&
          vergunning.eigenaar &&
          vergunning.aanvrager && (
            <InfoDetailGroup>
              <InfoDetail
                label="Eigenaar woning"
                value={vergunning.eigenaar ?? '-'}
              />
              <InfoDetail
                label="Aanvrager vergunning"
                value={vergunning.aanvrager ?? '-'}
              />
            </InfoDetailGroup>
          )}
        <Location label="Adres" location={vergunning.adres} />
        {vergunning.status === 'Afgehandeld' && vergunning.resultaat && (
          <InfoDetail label="Resultaat" value={vergunning.resultaat} />
        )}

        {vergunning.titel === 'Vergunning vakantieverhuur' && (
          <DocumentDetails
            vergunning={vergunning as unknown as VakantieverhuurVergunningDecos}
            trackPath={(document) =>
              `/downloads/toeristische-verhuur/vergunning-vakantieverhuur/${document.title}`
            }
          />
        )}
        {vergunning.titel === 'Vergunning bed & breakfast' &&
          !!vergunning.documents?.length &&
          FeatureToggle.bbDocumentDownloadsActive && (
            <InfoDetailGroup label="Documenten">
              <DocumentList documents={vergunning.documents} isExpandedView />
            </InfoDetailGroup>
          )}
      </PageContent>
      {!!vergunning.statussen.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory="Toeristisch verhuur detail / status"
          items={vergunning.statussen}
          id={`toeristische-verhuur-detail-${vergunning.id}`}
        />
      )}
    </>
  );
}
