import {
  BBVergunning,
  VakantieverhuurVergunning,
} from '../../../server/services/toeristische-verhuur/toeristische-verhuur-types';
import { VakantieverhuurVergunning as VakantieverhuurVergunningDecos } from '../../../server/services/vergunningen/vergunningen';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { DocumentList, LinkdInline, PageContent } from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine from '../../components/StatusLine/StatusLine';
import { DocumentDetails } from '../VergunningDetail/DocumentDetails';
import { Location } from '../VergunningDetail/Location';
import styles from './ToeristischeVerhuurDetail.module.scss';

export default function VergunningVerhuur({
  vergunning,
}: {
  vergunning: VakantieverhuurVergunning | BBVergunning;
}) {
  const isVakantieVerhuur = vergunning.title === 'Vergunning vakantieverhuur';

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
        {(vergunning.dateStartFormatted || vergunning.dateEndFormatted) && (
          <InfoDetailGroup>
            <InfoDetail
              label="Vanaf"
              value={vergunning.dateStartFormatted || '-'}
            />
            <InfoDetail
              label="Tot"
              value={vergunning.dateEndFormatted || '-'}
            />
          </InfoDetailGroup>
        )}

        <Location label="Adres" location={vergunning.adres} />
        {vergunning.steps.some(
          (step) => step.isChecked && step.status == 'Afgehandeld'
        ) &&
          vergunning.result && (
            <InfoDetail label="Resultaat" value={vergunning.result} />
          )}

        {vergunning.title === 'Vergunning vakantieverhuur' && (
          <DocumentDetails
            vergunning={vergunning as unknown as VakantieverhuurVergunningDecos}
            trackPath={(document) =>
              `/downloads/toeristische-verhuur/vergunning-vakantieverhuur/${document.title}`
            }
          />
        )}
        {vergunning.title === 'Vergunning bed & breakfast' &&
          !!vergunning.documents?.length &&
          FeatureToggle.bbDocumentDownloadsActive && (
            <InfoDetailGroup label="Documenten">
              <DocumentList documents={vergunning.documents} isExpandedView />
            </InfoDetailGroup>
          )}
      </PageContent>
      {!!vergunning.steps.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory="Toeristisch verhuur detail / status"
          items={vergunning.steps}
          id={`toeristische-verhuur-detail-${vergunning.id}`}
        />
      )}
    </>
  );
}
