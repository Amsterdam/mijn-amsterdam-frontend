import { useState } from 'react';

import { Alert, Badge, Paragraph } from '@amsterdam/design-system-react';
import { differenceInCalendarMonths } from 'date-fns';
import { generatePath } from 'react-router';

import {
  ContactgegevenTypeEnum,
  MAXIMUM_AGE_BEFORE_VALIDATION,
} from './CommunicatieVoorkeuren-config.ts';
import { useCommunicatieVoorkeurVerwijderen } from './useCommunicatieVoorkeuren.ts';
import type { ContactgegevenFrontend } from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { MaRouterLink } from '../../../../components/MaLink/MaLink.tsx';
import { ModalAndButton } from '../../../../components/Modal/Modal.tsx';
import { Spinner } from '../../../../components/Spinner/Spinner.tsx';
import {
  themaConfig,
  type InstelAction,
} from '../KlantContact-thema-config.ts';

type CommunicatieMediumValueProps = {
  contactgegeven: ContactgegevenFrontend;
  noValueText?: string;
};

function Value({
  contactgegeven,
  noValueText = 'Nog niet ingesteld',
}: CommunicatieMediumValueProps) {
  return (
    <>{contactgegeven.value ? contactgegeven.value : <em>{noValueText}</em>} </>
  );
}

function ContactgegevenRemoveModal({
  contactgegeven,
}: {
  contactgegeven: ContactgegevenFrontend;
}) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = useCommunicatieVoorkeurVerwijderen(contactgegeven);

  return (
    <ModalAndButton
      buttonLabel="Verwijderen"
      buttonVariant="ma-link-like"
      modal={{ title: 'E-mailadres verwijderen' }}
      actions={[
        {
          label: isLoading ? (
            <>
              <Spinner /> Bezig met verwijderen...
            </>
          ) : (
            'Ja, verwijderen'
          ),
          disabled: isLoading,
          buttonVariant: 'primary',
          onClick: async () => {
            setIsError(false);
            setIsLoading(true);
            const response = await handleDelete();
            setIsLoading(false);
            if (response.status !== 'OK') {
              setIsError(true);
              return false;
            }
            //

            return true;
          },
          doCloseModalOnClick: true,
        },
        {
          label: 'Nee, niet verwijderen',
          buttonVariant: 'tertiary',
          doCloseModalOnClick: true,
        },
      ]}
    >
      <Paragraph className="ams-mb-m">
        Weet u zeker dat u dit e-mailadres wilt verwijderen? U ontvangt dan geen
        e-mails meer van de gemeente Amsterdam.
      </Paragraph>
      {isError && (
        <Alert
          severity="error"
          className="ams-mb-m"
          heading="Verwijderen mislukt"
          headingLevel={2}
        >
          <Paragraph>
            Er is iets misgegaan bij het verwijderen van dit e-mailadres.
            Probeer het later opnieuw.
          </Paragraph>
        </Alert>
      )}
    </ModalAndButton>
  );
}

type ContactgegevenValueProps = {
  contactgegeven: ContactgegevenFrontend;
};

export function ContactgegevenValue({
  contactgegeven,
}: ContactgegevenValueProps) {
  const getRoute = (step: '1' | '2', action: InstelAction = 'instellen') =>
    generatePath(themaConfig.detailPageContactgegevenInstellen.route.path, {
      contactgegeven: contactgegeven.type,
      step,
      action,
    });

  switch (contactgegeven.type) {
    case ContactgegevenTypeEnum.Email: {
      const isOld =
        !!(contactgegeven.dateModified && contactgegeven.isVerified) &&
        differenceInCalendarMonths(new Date(), contactgegeven.dateModified) >=
          MAXIMUM_AGE_BEFORE_VALIDATION;
      const needsValidation =
        !!contactgegeven.value && (!contactgegeven.isVerified || isOld);
      return (
        <>
          <Value contactgegeven={contactgegeven} />
          {contactgegeven.value && contactgegeven.isVerified && (
            <>(Laatst gewijzigd op {contactgegeven.dateModifiedFormatted})</>
          )}
          <br />
          {needsValidation && (
            <>
              <Badge label="!" color="red" /> Dit e-mailadres is nog niet
              gevalideerd.{' '}
              <MaRouterLink href={getRoute('1', 'valideren')}>
                {isOld ? 'Opnieuw valideren' : 'Nu valideren'}
              </MaRouterLink>
            </>
          )}
          {contactgegeven.value && (
            <>
              {needsValidation && ' of '}
              <ContactgegevenRemoveModal contactgegeven={contactgegeven} />{' '}
            </>
          )}
          {!contactgegeven.value && (
            <MaRouterLink href={getRoute('1', 'instellen')}>
              Geef uw e-mailadres aan ons door
            </MaRouterLink>
          )}
        </>
      );
    }
    case ContactgegevenTypeEnum.Telefoonnummer: {
      return (
        <Paragraph>
          <Value contactgegeven={contactgegeven} />
          <br />
        </Paragraph>
      );
    }
    case ContactgegevenTypeEnum.ApplicatieId: {
      return (
        <Paragraph>
          <Value
            contactgegeven={contactgegeven}
            noValueText="Nog niet gekoppeld"
          />
          {contactgegeven.value && contactgegeven.isVerified && (
            <>(Gekoppeld op {contactgegeven.dateModifiedFormatted})</>
          )}
        </Paragraph>
      );
    }
    // case ContactgegevenType.Berichtenbox: {
    //   return (
    //     <Paragraph>
    //       <Value
    //         contactgegeven={contactgegeven}
    //         noValueText="Nog niet gekoppeld"
    //       />
    //     </Paragraph>
    //   );
    // }
    // Add more cases for other communication mediums
    case ContactgegevenTypeEnum.Postadres: {
      return (
        <Paragraph>
          <Value
            contactgegeven={contactgegeven}
            noValueText="Geen postadres bekend"
          />
        </Paragraph>
      );
    }
    default:
      return null;
  }
}
