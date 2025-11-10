import { type FormEventHandler, useState } from 'react';

import {
  ActionGroup,
  Button,
  DateInput,
  Paragraph,
} from '@amsterdam/design-system-react';
import { addDays } from 'date-fns';

import { getEMandateValidityDate } from './Afis-helpers';
import type { useEmandateApis } from './useAfisEmandatesData';
import type { AfisEMandateFrontend } from '../../../../server/services/afis/afis-types';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { Modal } from '../../../components/Modal/Modal';
import { Spinner } from '../../../components/Spinner/Spinner';

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
  const dateValidTo = getEMandateValidityDate(eMandate);
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
            Terug
          </Button>
        </ActionGroup>
      }
    >
      <>
        <Paragraph className="ams-mb-s">
          Nieuwe einddatum E-mandaat {eMandate.creditorName}
        </Paragraph>
        <form id="date-adjust-form" onSubmit={onSubmit}>
          <DateInput
            name="dateValidTo"
            type="date"
            min={minDate}
            defaultValue={dateValidTo}
          />
        </form>
      </>
    </Modal>
  );
}

export function DateAdjust({
  eMandate,
  lifetimeUpdateApi,
}: {
  eMandate: AfisEMandateFrontend;
  lifetimeUpdateApi: ReturnType<typeof useEmandateApis>['lifetimeUpdateApi'];
}) {
  const [isDateAdjustModalActive, setDateAdjustModal] = useState(false);

  return (
    <div>
      {lifetimeUpdateApi.isLoading ? (
        <Spinner />
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
        datum aanpassen
      </MaRouterLink>
      <DateAdjustModal
        eMandate={eMandate}
        isDateAdjustModalActive={isDateAdjustModalActive}
        setDateAdjustModal={setDateAdjustModal}
        onSubmit={(event) => {
          event.preventDefault();
          const formdata = new FormData(event.currentTarget);
          setDateAdjustModal(false);
          lifetimeUpdateApi.update(formdata.get('dateValidTo') as string);
        }}
      />
    </div>
  );
}
