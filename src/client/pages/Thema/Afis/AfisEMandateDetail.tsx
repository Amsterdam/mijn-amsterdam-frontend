import { useState, type FormEventHandler } from 'react';

import {
  ActionGroup,
  Button,
  Paragraph,
  DateInput,
} from '@amsterdam/design-system-react';
import { addDays, addYears } from 'date-fns';

import { routeConfig, type WithActionButtons } from './Afis-thema-config';
import {
  useAfisEMandatesData,
  useAfisEmandateUpdate,
  useAfisThemaData,
} from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { Modal } from '../../../components/Modal/Modal';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type DateAdjustModalProps = {
  eMandate: AfisEMandateFrontend;
  isDateAdjustModalActive: boolean;
  setDateAdjustModal: (isActive: boolean) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

function DateAdjustModal({
  eMandate,
  isDateAdjustModalActive,
  setDateAdjustModal,
  onSubmit,
}: DateAdjustModalProps) {
  const minDate = addDays(new Date(), 1).toISOString().split('T')[0]; // Set minimum date to tomorrow.
  const currentDate =
    eMandate.dateValidTo?.includes('9999') || !eMandate.dateValidTo
      ? addYears(new Date(), 1).toISOString().split('T')[0]
      : eMandate.dateValidTo;
  return (
    <Modal
      title="E-Mandaat einddatum aanpassen"
      isOpen={isDateAdjustModalActive}
      showCloseButton
      closeOnEscape
      onClose={() => setDateAdjustModal(false)}
      pollingQuerySelector="#date-adjust-action"
      actions={
        <ActionGroup>
          <Button
            id="date-adjust-action"
            type="submit"
            form="date-adjust-form"
            variant="primary"
          >
            Nu aanpassen
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setDateAdjustModal(false);
            }}
          >
            terug
          </Button>
        </ActionGroup>
      }
    >
      <>
        <Paragraph className="ams-mb-s">
          Nieuwe einddatum E-mandaat {eMandate.acceptant}
        </Paragraph>
        <form id="date-adjust-form" onSubmit={onSubmit}>
          <DateInput
            name="endDate"
            type="date"
            min={minDate}
            defaultValue={currentDate}
          />
        </form>
      </>
    </Modal>
  );
}

function DateAdjust({ eMandate }: { eMandate: AfisEMandateFrontend }) {
  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const [isDateAdjustModalActive, setDateAdjustModal] = useState(false);
  const { isMutating, update, error } = useAfisEmandateUpdate(
    businessPartnerIdEncrypted,
    eMandate
  );

  const dateContent = eMandate.dateValidTo?.includes('9999')
    ? 'doorlopend'
    : eMandate.dateValidToFormatted;

  console.log('error', error);

  return (
    <div>
      {isMutating ? (
        <LoadingContent inline barConfig={[['140px', '2rem', '0']]} />
      ) : (
        dateContent
      )}
      &nbsp;&nbsp;
      <MaRouterLink
        href={window.location.pathname}
        onClick={(event) => {
          event.preventDefault();
          setDateAdjustModal(true);
        }}
      >
        einddatum aanpassen
      </MaRouterLink>
      {error && <Paragraph size="small">{error.message}</Paragraph>}
      <DateAdjustModal
        eMandate={eMandate}
        isDateAdjustModalActive={isDateAdjustModalActive}
        setDateAdjustModal={setDateAdjustModal}
        onSubmit={(event) => {
          event.preventDefault();
          const formdata = new FormData(event.currentTarget);
          setDateAdjustModal(false);
          update(formdata.get('endDate') as string);
        }}
      />
    </div>
  );
}

type EMandateProps = {
  eMandate: WithActionButtons<AfisEMandateFrontend>;
};

function EMandate({ eMandate }: EMandateProps) {
  return (
    <PageContentCell>
      <Datalist
        rows={[
          {
            rows: [
              {
                label: 'Afdeling gemeente',
                content: (
                  <>
                    <div className="ams-mb-s">{eMandate.acceptant}</div>
                    {eMandate.acceptantDescription && (
                      <Paragraph size="small">
                        {eMandate.acceptantDescription}
                      </Paragraph>
                    )}
                  </>
                ),
              },
              {
                label: 'IBAN gemeente',
                content: eMandate.acceptantIBAN,
              },
            ],
          },
          {
            rows: [
              {
                label: 'Status',
                content: eMandate.displayStatus,
              },
              {
                label: 'Einddatum',
                isVisible: eMandate.status === '1',
                content: <DateAdjust eMandate={eMandate} />,
              },
            ],
          },
          ...(eMandate.status === '1'
            ? [
                {
                  rows: [
                    {
                      label: 'Naam rekeninghouder',
                      content: eMandate.senderName || 'Onbekend',
                    },
                    {
                      label: 'IBAN rekeninghouder',
                      content: eMandate.senderIBAN || 'Onbekend',
                    },
                  ],
                },
              ]
            : []),
          {
            label: '',
            content: eMandate.action,
          },
        ]}
      />
    </PageContentCell>
  );
}

export function AfisEMandateDetail() {
  useHTMLDocumentTitle(routeConfig.detailPageEMandate);

  const {
    title,
    eMandate,
    breadcrumbs,
    hasEMandatesError,
    isLoadingEMandates,
  } = useAfisEMandatesData();

  return (
    <ThemaDetailPagina
      title={title}
      zaak={eMandate}
      isError={hasEMandatesError}
      isLoading={isLoadingEMandates}
      pageContentMain={!!eMandate && <EMandate eMandate={eMandate} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
