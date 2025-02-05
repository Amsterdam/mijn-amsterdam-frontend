import { useParams } from 'react-router-dom';

import { AanbiedenDiensten } from './AanbiedenDiensten';
import { BZB } from './BZB';
import { BZP } from './BZP';
import { DocumentDetails } from './DocumentDetails';
import { EigenParkeerplaats } from './EigenParkeerplaats';
import { EigenParkeerplaatsOpheffen } from './EigenParkeerplaatsOpheffen';
import { ERVV } from './ERVV';
import { EvenementMelding } from './EvenementMelding';
import { EvenementVergunning } from './EvenementVergunning';
import { Flyeren } from './Flyeren';
import { GPK } from './GPK';
import { GPP } from './GPP';
import { Nachtwerkontheffing } from './Nachtwerkontheffing';
import { Omzettingsvergunning } from './Omzettingsvergunning';
import { RvvHeleStad } from './RvvHeleStad';
import { RvvSloterweg } from './RvvSloterweg';
import { StatusLineItems } from './StatusLineItems';
import { Touringcar } from './Touringcar';
import { TVMRVVObject } from './TVMRVVObject';
import styles from './VergunningDetail.module.scss';
import { VOB } from './VOB';
import { Woonvergunningen } from './Woonvergunningen';
import { WVOS } from './WVOS';
import { ZwaarVerkeer } from './ZwaarVerkeer';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  isWoonvergunning,
  showDocuments,
} from '../../../universal/helpers/vergunningen';
import { LinkProps } from '../../../universal/types';
import { CaseType } from '../../../universal/types/vergunningen';
import { ErrorAlert, LinkdInline, LoadingContent } from '../../components';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';

interface VergunningDetailProps {
  backLink?: LinkProps;
}

export default function VergunningDetail({ backLink }: VergunningDetailProps) {
  const { VERGUNNINGEN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = VERGUNNINGEN.content?.find((item) => item.id === id);
  const noContent = !isLoading(VERGUNNINGEN) && !Vergunning;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={backLink?.to}>
          {Vergunning?.title || 'Vergunning'}
        </PageHeadingV2>
        <PageContentCell>
          {(isError(VERGUNNINGEN) || noContent) && (
            <ErrorAlert>
              We kunnen op dit moment geen gegevens tonen.
            </ErrorAlert>
          )}
          {isLoading(VERGUNNINGEN) && (
            <LoadingContent className={styles.LoadingContentInfo} />
          )}
          {!isLoading(VERGUNNINGEN) && Vergunning && (
            <>
              {Vergunning.caseType === CaseType.TVMRVVObject && (
                <TVMRVVObject vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.GPK && (
                <GPK vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.GPP && (
                <GPP vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.ERVV && (
                <ERVV vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.Omzettingsvergunning && (
                <Omzettingsvergunning vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.EvenementVergunning && (
                <EvenementVergunning vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.EvenementMelding && (
                <EvenementMelding vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.BZP && (
                <BZP vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.BZB && (
                <BZB vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.Flyeren && (
                <Flyeren vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.AanbiedenDiensten && (
                <AanbiedenDiensten vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.NachtwerkOntheffing && (
                <Nachtwerkontheffing vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.ZwaarVerkeer && (
                <ZwaarVerkeer vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.VOB && (
                <VOB vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.RVVHeleStad && (
                <RvvHeleStad vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.RVVSloterweg && (
                <RvvSloterweg vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.EigenParkeerplaats && (
                <EigenParkeerplaats vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.EigenParkeerplaatsOpheffen && (
                <EigenParkeerplaatsOpheffen vergunning={Vergunning} />
              )}
              {(Vergunning.caseType === CaseType.TouringcarDagontheffing ||
                Vergunning.caseType === CaseType.TouringcarJaarontheffing) && (
                <Touringcar vergunning={Vergunning} />
              )}
              {Vergunning.caseType === CaseType.WVOS && (
                <WVOS vergunning={Vergunning} />
              )}

              {isWoonvergunning(Vergunning) && (
                <Woonvergunningen vergunning={Vergunning} />
              )}

              {showDocuments(Vergunning.caseType) &&
                !!Vergunning.documentsUrl && (
                  <DocumentDetails vergunning={Vergunning} />
                )}

              {Vergunning.caseType === CaseType.BZP &&
                Vergunning.decision === 'Verleend' &&
                Vergunning.status === 'Afgehandeld' && (
                  <p className={styles.Disclaimer}>
                    U kunt uw kenteken{' '}
                    <LinkdInline
                      external
                      href="https://www.amsterdam.nl/parkeren-verkeer/parkeervergunning/ontheffing-blauwe-zone-aanvragen/#hf1dde781-fd6f-462f-8e9c-6b86d42019b8"
                    >
                      hier
                    </LinkdInline>{' '}
                    wijzigen. Doorgevoerde wijzigingen worden niet getoond in
                    Mijn Amsterdam.
                  </p>
                )}
            </>
          )}
        </PageContentCell>
      </PageContentV2>
      {!isLoading(VERGUNNINGEN) && Vergunning && (
        <StatusLineItems
          vergunning={Vergunning}
          trackPath={(document) =>
            `/downloads/vergunningen/${Vergunning.caseType.toLocaleLowerCase()}/${
              document.title
            }`
          }
        />
      )}
    </DetailPageV2>
  );
}
