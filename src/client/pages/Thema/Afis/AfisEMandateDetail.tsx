import { useState } from 'react';

import {
  ActionGroup,
  Button,
  Paragraph,
  DateInput,
} from '@amsterdam/design-system-react';
import { addDays, addYears } from 'date-fns';

import { routeConfig, type WithActionButtons } from './Afis-thema-config';
import { useAfisEMandatesData } from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { MaButtonLink } from '../../../components/MaLink/MaLink';
import { Modal } from '../../../components/Modal/Modal';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type DateAdjustModalProps = {
  eMandate: AfisEMandateFrontend;
  isDateAdjustModalActive: boolean;
  setDateAdjustModal: (isActive: boolean) => void;
};

function DateAdjustModal({
  eMandate,
  isDateAdjustModalActive,
  setDateAdjustModal,
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
            variant="primary"
            onClick={() => {
              setDateAdjustModal(false);
              // TODO: Send new date to backend
            }}
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
        <DateInput type="date" min={minDate} value={currentDate} />
      </>
    </Modal>
  );
}

type EMandateProps = {
  eMandate: WithActionButtons<AfisEMandateFrontend>;
};

function EMandate({ eMandate }: EMandateProps) {
  const [isDateAdjustModalActive, setDateAdjustModal] = useState(false);
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
                isVisible: !!eMandate.senderName,
                content: (
                  <>
                    {eMandate.dateValidTo?.includes('9999')
                      ? 'doorlopend'
                      : eMandate.dateValidToFormatted}{' '}
                    &nbsp;
                    <>
                      <MaButtonLink
                        variant="secondary"
                        onClick={() => setDateAdjustModal(true)}
                      >
                        einddatum aanpassen
                      </MaButtonLink>
                      <DateAdjustModal
                        eMandate={eMandate}
                        isDateAdjustModalActive={isDateAdjustModalActive}
                        setDateAdjustModal={setDateAdjustModal}
                      />
                    </>
                  </>
                ),
              },
            ],
          },
          ...(eMandate.senderName
            ? [
                {
                  rows: [
                    {
                      label: 'Naam rekeninghouder',
                      content: eMandate.senderName ?? '-',
                    },
                    {
                      label: 'IBAN rekeninghouder',
                      content: eMandate.senderIBAN ?? '-',
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
