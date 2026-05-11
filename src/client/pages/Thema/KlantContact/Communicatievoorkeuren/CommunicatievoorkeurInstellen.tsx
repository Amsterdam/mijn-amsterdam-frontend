import { useState } from 'react';

import {
  Field,
  Label,
  Paragraph,
  Switch,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { generatePath, useNavigate, useParams } from 'react-router';

import { VoorkeurByTypeLabels } from './CommunicatieVoorkeuren-config.ts';
import styles from './CommunicatieVoorkeuren.module.scss';
import { EmailForm, EmailVerify } from './EmailInputAndValidation.tsx';
import { useCommunicatieVoorkeurInstellen } from './useCommunicatieVoorkeuren.tsx';
import type {
  CommunicatieMediumSetting,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import { MaButtonInline } from '../../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useSessionStorage } from '../../../../hooks/storage.hook.ts';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { routeConfig } from '../Contact-thema-config.ts';

type EmailInstellenProps = {
  medium: CommunicatieMediumSetting;
  voorkeur?: Communicatievoorkeur | null;
  onFinished: (email: string) => void;
};

function EmailInstellen({ medium, voorkeur, onFinished }: EmailInstellenProps) {
  const navigate = useNavigate();
  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `voorkeur-${voorkeur?.id || ''}-${medium.type}`,
    medium.value ?? ''
  );

  const [emailFormActive, setEmailFormActive] = useState(false);

  const { step = '1' } = useParams<{ step: string }>();

  const medium_: CommunicatieMediumSetting = {
    ...medium,
    value: emailLocal || medium.value,
  };

  const emailValue = medium.value || '';

  function navigateToStep(step: '1' | '2') {
    const path = voorkeur
      ? routeConfig.detailPageCommunicatievoorkeurInstellen.path
      : routeConfig.detailPageCommunicatieMediumInstellen.path;

    navigate(
      generatePath(path, {
        medium: medium_.type,
        id: voorkeur?.id,
        step,
      })
    );
  }

  return (
    medium?.type === 'email' && (
      <>
        {step === '1' && (
          <>
            {!!voorkeur && (
              <>
                <Paragraph className="ams-mb-m">
                  Hier kunt u uw e-mailadres doorgeven. U krijgt dan e-mails van{' '}
                  {voorkeur.stakeholder} over de volgende onderwerpen:
                </Paragraph>
                <UnorderedList className="ams-mb-m">
                  <UnorderedList.Item>
                    {voorkeur.description}
                  </UnorderedList.Item>
                </UnorderedList>
                {!!medium.value && (
                  <Field className="ams-mb-m">
                    <Label>
                      Wilt u deze informatie per{' '}
                      {VoorkeurByTypeLabels[medium_.type]} ontvangen?
                    </Label>
                    <span className={styles.Switch}>
                      <Switch
                        title={
                          medium.value
                            ? 'Klik om uit te schakelen'
                            : 'Klik om in te schakelen'
                        }
                        onChange={(event) => {
                          if (medium.value) {
                            onFinished(medium.value);
                          }
                          if (!event.target.checked) {
                            setEmailFormActive(false);
                          }
                        }}
                        checked={!!medium.value}
                      />{' '}
                      &nbsp;
                      {medium.value ? (
                        <>
                          Ja, naar {emailValue}{' '}
                          {!emailFormActive && (
                            <MaButtonInline
                              onClick={() => setEmailFormActive(true)}
                            >
                              Wijzigen
                            </MaButtonInline>
                          )}
                        </>
                      ) : (
                        <>Nee</>
                      )}
                    </span>
                  </Field>
                )}
              </>
            )}
            {(!emailValue || emailFormActive) && (
              <EmailForm
                onSubmit={({ email }) => {
                  setEmailLocal(email);
                  navigateToStep('2');
                }}
                email={emailValue}
              />
            )}
          </>
        )}
        {step === '2' && (
          <EmailVerify
            email={medium_.value || emailLocal}
            onValidated={({ otp, email }) => {
              setEmailLocal('');
              onFinished(email);
            }}
          />
        )}
      </>
    )
  );
}

export function CommunicatievoorkeurInstellen() {
  const {
    voorkeur,
    medium,
    isLoading,
    isError,
    title,
    themaId,
    breadcrumbs,
    update,
  } = useCommunicatieVoorkeurInstellen();
  useHTMLDocumentTitle(routeConfig.detailPageCommunicatievoorkeurInstellen);

  const navigate = useNavigate();
  function navigateToThemaPage() {
    navigate(routeConfig.themaPage.path);
  }

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaId}
      isLoading={isLoading}
      isError={isError}
      zaak={voorkeur ?? {}}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        medium && (
          <PageContentCell spanWide={8}>
            <EmailInstellen
              voorkeur={voorkeur}
              medium={medium}
              onFinished={(email) => {
                update({
                  type: 'email',
                  value: email,
                  voorkeurId: voorkeur?.id, // TODO: Fix type mismatch
                });
                navigateToThemaPage();
              }}
            />
          </PageContentCell>
        )
      }
    />
  );
}
