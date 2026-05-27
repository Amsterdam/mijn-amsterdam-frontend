import { generatePath, useNavigate, useParams } from 'react-router';

import { useCommunicatieVoorkeurInstellen } from './useCommunicatieVoorkeuren.ts';
import {
  ContactgegevenForm,
  ContactgegevenVerify,
} from './ValueInputAndValidation.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useSessionStorage } from '../../../../hooks/storage.hook.ts';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';
import { ContactgegevenTypeEnum } from './CommunicatieVoorkeuren-config.ts';
import { NotFound } from '../../../NotFound/NotFound.tsx';

export function ContactgegevenInstellen() {
  const navigate = useNavigate();
  const { themaConfig, breadcrumbs, communicatievoorkeuren } =
    useKlantcontactData();
  const { contactgegevenType, title, routeConfig } =
    useCommunicatieVoorkeurInstellen();

  useHTMLDocumentTitle(routeConfig);

  const { step = '1' } = useParams<{
    step: string;
  }>();

  const [valueLocal, setValueLocal] = useSessionStorage(
    `standaard-${contactgegevenType}-voorkeur-instellen`,
    ''
  );

  if (
    (contactgegevenType && !(contactgegevenType in ContactgegevenTypeEnum)) ||
    !contactgegevenType
  ) {
    return <NotFound />;
  }

  const currentValue =
    communicatievoorkeuren?.standaardContactgegevens?.[contactgegevenType]
      ?.value;

  function navigateToStep(step: '1' | '2') {
    navigate(
      generatePath(themaConfig.detailPageContactgegevenInstellen.route.path, {
        step,
        contactgegeven: contactgegevenType,
        action: 'instellen',
      })
    );
  }

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaConfig.id}
      zaak={{}}
      isLoading={false}
      isError={false}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        contactgegevenType && (
          <PageContentCell spanWide={8}>
            {step === '1' && (
              <ContactgegevenForm
                value={valueLocal || currentValue || ''}
                type={contactgegevenType}
                onSubmit={({ type, value }, success) => {
                  setValueLocal(value ?? ''); // If we reload the page after setting the email in session storage, we can prefill the email field with the previously entered value.
                  if (success) {
                    navigateToStep('2');
                  }
                }}
              />
            )}
            {step === '2' && (
              <ContactgegevenVerify
                value={valueLocal}
                type={contactgegevenType}
                onVerified={({ otp, value, type }) => {
                  setValueLocal('');
                  // update({
                  //   type,
                  //   value,
                  // });
                  navigate(themaConfig.route.path);
                }}
              />
            )}
          </PageContentCell>
        )
      }
    />
  );
}
