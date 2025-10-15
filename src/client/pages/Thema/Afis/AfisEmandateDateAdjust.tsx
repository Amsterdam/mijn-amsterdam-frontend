import { type FormEventHandler, useState } from 'react';

import {
  ActionGroup,
  Button,
  DateInput,
  Paragraph,
} from '@amsterdam/design-system-react';
import { addDays, addYears } from 'date-fns';

import { EMANDATE_ENDDATE_INDICATOR } from './Afis-thema-config';
import {
  useAfisThemaData,
  useAfisEmandateUpdate,
} from './useAfisThemaData.hook';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { Modal } from '../../../components/Modal/Modal';

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
    eMandate.dateValidTo?.includes(EMANDATE_ENDDATE_INDICATOR) ||
    !eMandate.dateValidTo
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

export function DateAdjust({ eMandate }: { eMandate: AfisEMandateFrontend }) {
  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const [isDateAdjustModalActive, setDateAdjustModal] = useState(false);
  const { isMutating, update, error } = useAfisEmandateUpdate(
    businessPartnerIdEncrypted,
    eMandate
  );

  console.log('error', error);

  return (
    <div>
      {isMutating ? (
        <LoadingContent inline barConfig={[['140px', '2rem', '0']]} />
      ) : (
        eMandate.dateValidToFormatted
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
