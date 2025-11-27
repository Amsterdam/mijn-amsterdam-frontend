import { useEffect, useState } from 'react';

import {
  ActionGroup,
  Alert,
  Button,
  Heading,
  Link,
  Paragraph,
} from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import { themaConfig } from './HLI-thema-config';
import styles from './HLIStadspasDetail.module.scss';
import { useBlockStadspas, useStadspassen } from './useStadspassen.hook';
import {
  StadspasBudget,
  StadspasBudgetTransaction,
  StadspasFrontend,
} from '../../../../server/services/hli/stadspas-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { dateSort } from '../../../../universal/helpers/date';
import ErrorAlert from '../../../components/Alert/Alert';
import { Datalist } from '../../../components/Datalist/Datalist';
import LoadingContent, {
  BarConfig,
} from '../../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { Modal } from '../../../components/Modal/Modal';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../../components/Page/Page';
import { PageHeadingV2 } from '../../../components/PageHeading/PageHeadingV2';
import { Spinner } from '../../../components/Spinner/Spinner';
import { TableV2 } from '../../../components/Table/TableV2';
import { getRedactedClass } from '../../../helpers/cobrowse';
import { useBffApi } from '../../../hooks/api/useBffApi';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

const loadingContentBarConfigDetails: BarConfig = [
  ['10rem', '2rem', '.5rem'],
  ['16rem', '2rem', '3rem'],
  ['10rem', '2rem', '.5rem'],
  ['25rem', '2rem', '3rem'],
  ['8rem', '2rem', '.5rem'],
  ['5rem', '2rem', '3rem'],
];
const loadingContentBarConfigList: BarConfig = [
  ['60rem', '2rem', '.5rem'],
  ['60rem', '2rem', '4rem'],
];

const budgetFieldName = 'Tegoed';

const displayPropsTransacties = {
  title: 'Bij',
  datePublishedFormatted: 'Datum',
  amountFormatted: 'Bedrag',
};

const displayPropsTransactiesWithBudget = {
  title: displayPropsTransacties.title,
  budget: budgetFieldName,
  datePublishedFormatted: displayPropsTransacties.datePublishedFormatted,
  amountFormatted: displayPropsTransacties.amountFormatted,
};

const displayPropsBudgets = {
  title: budgetFieldName,
  dateEndFormatted: 'Geldig t/m',
  budgetAssignedFormatted: 'Bedrag',
};

const PHONENUMBERS = {
  CCA: '14 020',
  WerkEnInkomen: '020 252 6000',
} as const;

export function HLIStadspasDetail() {
  const isPhoneScreen = useSmallScreen();
  const appState = useAppStateGetter();
  useHTMLDocumentTitle(themaConfig.detailPageStadspas.route);

  const { HLI } = appState;
  const { passNumber } = useParams<{ passNumber: string }>();
  const stadspassen = useStadspassen();

  const stadspas = stadspassen.find(
    (pass) => pass.passNumber.toString() === passNumber
  );

  const isErrorStadspas = isError(HLI);
  const isLoadingStadspas = isLoading(HLI);
  const noContent = !stadspas;

  const NAME = {
    label: 'Naam',
    content: stadspas?.owner.firstname,
  };

  const NUMBER = {
    label: 'Stadspasnummer',
    content: stadspas?.passNumberComplete,
  };

  const BALANCE = {
    label: 'Saldo',
    content: `${stadspas?.balanceFormatted} (Dit is het bedrag dat u nog kunt uitgeven)`,
  };

  const transactionsApi = useBffApi<StadspasBudgetTransaction[]>(
    stadspas?.urlTransactions
  );
  const isLoadingTransacties = transactionsApi.isLoading;

  const transactions =
    stadspas?.budgets && transactionsApi.data?.content
      ? transactionsApi.data.content
      : [];

  const hasTransactions = !!transactionsApi.data?.content?.length;

  const showMultiBudgetTransactions =
    !!stadspas?.budgets.length && stadspas.budgets.length > 1 && !isPhoneScreen;

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return (
    <DetailPageV2>
      <PageContentV2 className={getRedactedClass(themaConfig.id)}>
        <PageHeadingV2 breadcrumbs={breadcrumbs}>
          Overzicht Stadspas{' '}
          {stadspas?.owner && ` van ${stadspas?.owner.firstname}`}
        </PageHeadingV2>

        {stadspas ? (
          <>
            <PageContentCell>
              <Datalist rows={[NAME]} />
              <Paragraph className={styles.StadspasNummerInfo}>
                Hieronder staat het Stadspasnummer van uw{' '}
                {stadspas.actief ? 'actieve' : 'geblokkeerde'} pas.
                <br /> Dit pasnummer staat ook op de achterkant van uw pas.
              </Paragraph>
              <Datalist rows={[NUMBER]} />
              {!!stadspas.budgets.length && <Datalist rows={[BALANCE]} />}
              {!stadspas.actief && <PassBlockedAlert />}
              {stadspas.blockPassURL && stadspas.actief && (
                <BlockStadspas stadspas={stadspas} />
              )}
              {stadspas.unblockPassURL && !stadspas.actief && (
                <UnblockStadspas stadspas={stadspas} />
              )}
            </PageContentCell>
          </>
        ) : (
          <PageContentCell>
            {isLoadingStadspas && (
              <LoadingContent barConfig={loadingContentBarConfigDetails} />
            )}
            {(isErrorStadspas || (!isLoadingStadspas && noContent)) && (
              <ErrorAlert>
                We kunnen op dit moment geen gegevens tonen.{' '}
                <MaRouterLink href={themaConfig.route.path}>
                  Naar het overzicht
                </MaRouterLink>
              </ErrorAlert>
            )}
          </PageContentCell>
        )}
        <PageContentCell>
          <Heading size="level-3" level={3} className="ams-mb-m">
            Gekregen tegoed
          </Heading>
          {isLoadingStadspas && (
            <LoadingContent barConfig={loadingContentBarConfigList} />
          )}
          {!isLoadingStadspas && !!stadspas?.budgets.length && (
            <TableV2<StadspasBudget>
              className={styles.Table_budgets}
              items={stadspas.budgets.toSorted(dateSort('dateEnd', 'asc'))}
              displayProps={displayPropsBudgets}
            />
          )}
          {!isLoadingStadspas && !stadspas?.budgets.length && (
            <Paragraph>U heeft (nog) geen tegoed gekregen.</Paragraph>
          )}
        </PageContentCell>
        <PageContentCell>
          <Heading size="level-3" level={3} className="ams-mb-m">
            Uw uitgaven
          </Heading>
          {(isLoadingTransacties || isLoadingStadspas) && (
            <LoadingContent barConfig={loadingContentBarConfigList} />
          )}
          {!isLoadingStadspas && !isLoadingTransacties && (
            <Paragraph>
              {determineUwUitgavenDescription(stadspas, hasTransactions)}
            </Paragraph>
          )}
        </PageContentCell>
        {!isLoadingTransacties && hasTransactions && (
          <PageContentCell>
            <TableV2<StadspasBudgetTransaction>
              className={
                showMultiBudgetTransactions
                  ? styles.Table_transactions__withBudget
                  : styles.Table_transactions
              }
              items={transactions.toSorted(dateSort('datePublished', 'desc'))}
              displayProps={
                showMultiBudgetTransactions
                  ? displayPropsTransactiesWithBudget
                  : displayPropsTransacties
              }
            />
          </PageContentCell>
        )}
      </PageContentV2>
    </DetailPageV2>
  );
}

function determineUwUitgavenDescription(
  stadspas: StadspasFrontend | undefined,
  hasTransactions: boolean
) {
  const expenseInfoTextBase = <>U heeft nog geen uitgaven.</>;

  const extraInfo = (
    <>
      Deze informatie kan een dag achterlopen. Maar het saldo dat u nog over
      heeft klopt altijd.
    </>
  );

  if (!stadspas) {
    return expenseInfoTextBase;
  }

  if (hasTransactions) {
    return (
      <>
        Hieronder ziet u bij welke winkels u het tegoed hebt uitgegeven. Deze
        informatie kan een dag achterlopen. Maar het saldo dat u nog over heeft
        klopt altijd.
      </>
    );
  } else if (stadspas.budgets && stadspas.balance > 0) {
    return (
      <>
        {expenseInfoTextBase}
        {extraInfo}
      </>
    );
  }
  return expenseInfoTextBase;
}

function BlockStadspas({ stadspas }: { stadspas: StadspasFrontend }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const { isError, isLoading, fetch } = useBlockStadspas(stadspas.passNumber);

  useEffect(() => {
    if (isError && !isLoading && !showError) {
      setShowError(true);
    }
  }, [isError, showError, isLoading]);

  return (
    <>
      {showError && (
        <Alert
          className="ams-mb-m"
          heading="Fout bij het blokeren van de pas"
          severity="error"
          headingLevel={4}
        >
          <Paragraph>
            Probeer het later nog eens. Als dit niet lukt bel dan naar{' '}
            <Link href={`tel:${PHONENUMBERS.WerkEnInkomen}`}>
              {PHONENUMBERS.WerkEnInkomen}
            </Link>
          </Paragraph>
        </Alert>
      )}
      {isLoading ? (
        <Alert severity="warning" heading="Blokkeren" headingLevel={4}>
          <Paragraph>
            <Spinner /> <span>Bezig met het blokkeren van de pas...</span>
          </Paragraph>
        </Alert>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Blokkeer deze Stadspas
        </Button>
      )}

      <Modal
        title="Uw pas is gestolen of u bent deze kwijt."
        className={styles.BlokkeerDialog}
        isOpen={isModalOpen}
        showCloseButton
        closeOnEscape
        onClose={() => setIsModalOpen(false)}
        pollingQuerySelector="#blokkeer-pas"
        actions={
          <ActionGroup>
            <Button
              id="blokkeer-pas"
              type="submit"
              variant="primary"
              onClick={() => {
                setShowError(false);
                setIsModalOpen(false);
                if (stadspas.blockPassURL) {
                  fetch(stadspas.blockPassURL);
                }
              }}
            >
              Ja, blokkeer mijn pas
            </Button>
            <Button
              variant="tertiary"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Nee, blokkeer mijn pas niet
            </Button>
          </ActionGroup>
        }
      >
        <Paragraph className="ams-mb-m">
          Blokkeer hier uw Stadspas. Dan kan niemand uw Stadspas gebruiken. Of
          het tegoed uitgeven dat erop staat.
        </Paragraph>
        <Paragraph className="ams-mb-m">
          Let op: het blokkeren kan alleen worden teruggedraaid door te bellen
          met{' '}
          <Link href={`tel:${PHONENUMBERS.WerkEnInkomen}`}>
            {PHONENUMBERS.WerkEnInkomen}
          </Link>
          .
        </Paragraph>
        <Paragraph>
          Om een nieuwe pas aan te vragen, belt u ook naar{' '}
          <Link href={`tel:${PHONENUMBERS.WerkEnInkomen}`}>
            {PHONENUMBERS.WerkEnInkomen}
          </Link>
          . De nieuwe pas wordt binnen 3 weken thuisgestuurd. Binnen 5 dagen
          staat de nieuwe pas digitaal in de Amsterdam App.
        </Paragraph>
      </Modal>
    </>
  );
}

function PassBlockedAlert() {
  return (
    <Alert
      headingLevel={4}
      heading="Deze pas heeft u geblokkeerd, hoe nu verder?"
      severity="warning"
      className={
        themaConfig.featureToggle.stadspas._hliThemaStadspasDeblokkerenActive
          ? 'ams-mb-l'
          : ''
      }
    >
      <Paragraph>
        Wilt u uw pas deblokkeren of wilt u een nieuwe pas aanvragen? Bel dan
        naar{' '}
        <Link href={`tel:${PHONENUMBERS.WerkEnInkomen}`}>
          {PHONENUMBERS.WerkEnInkomen}
        </Link>{' '}
        Na het telefoongesprek kun je de pas meteen weer gebruiken.
      </Paragraph>
      <Paragraph>
        De nieuwe pas wordt binnen drie weken thuisgestuurd en is dan meteen te
        gebruiken.
      </Paragraph>
      <Paragraph>
        Stond er nog tegoed op de Stadspas? Dan staat het tegoed dat over was
        ook weer op de nieuwe pas.
      </Paragraph>
    </Alert>
  );
}

function UnblockStadspas({ stadspas }: { stadspas: StadspasFrontend }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const { isError, isLoading, fetch } = useBlockStadspas(stadspas.passNumber);

  useEffect(() => {
    if (isError && !isLoading && !showError) {
      setShowError(true);
    }
  }, [isError, showError, isLoading]);

  return (
    <PageContentCell>
      {showError && (
        <Alert
          className="ams-mb-m"
          heading="Fout bij het deblokkeren van de pas"
          severity="error"
          headingLevel={4}
        >
          <Paragraph>Probeer het nog eens.</Paragraph>
        </Alert>
      )}
      {isLoading ? (
        <Alert heading="Deblokkeren" headingLevel={4} severity="warning">
          <Paragraph>
            <Spinner /> <span>Bezig met deblokkeren...</span>
          </Paragraph>
        </Alert>
      ) : (
        <Button
          variant="secondary"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Deblokkeer
        </Button>
      )}

      <Modal
        title="Weet u zeker dat u uw Stadspas wilt deblokkeren?"
        className={styles.BlokkeerDialog}
        isOpen={isModalOpen}
        showCloseButton
        closeOnEscape
        onClose={() => setIsModalOpen(false)}
        pollingQuerySelector="#deblokkeer-pas"
        actions={
          <ActionGroup>
            <Button
              id="deblokkeer-pas"
              type="submit"
              variant="primary"
              onClick={() => {
                setShowError(false);
                setIsModalOpen(false);
                if (stadspas.unblockPassURL) {
                  fetch(stadspas.unblockPassURL);
                }
              }}
            >
              Deblokkeer
            </Button>
            <Button
              variant="tertiary"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Doe niks
            </Button>
          </ActionGroup>
        }
      >
        Deblokkeren die pas!
      </Modal>
    </PageContentCell>
  );
}

export const forTesting = {
  determineUwUitgavenDescription,
};
