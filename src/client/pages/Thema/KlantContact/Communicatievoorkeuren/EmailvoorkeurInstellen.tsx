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
import type {
  ContactgegevenFrontend,
  CommunicatievoorkeurFrontend,
} from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import { MaLinkLikeButton } from '../../../../components/MaLink/MaLink.tsx';
import { useSessionStorage } from '../../../../hooks/storage.hook.ts';
import {
  themaConfig,
  type InstelAction,
} from '../KlantContact-thema-config.ts';

type EmailInstellenProps = {
  medium: ContactgegevenFrontend;
  voorkeur?: CommunicatievoorkeurFrontend | null;
  onFinished: (email: string) => void;
};

export function EmailInstellen({
  medium,
  voorkeur,
  onFinished,
}: EmailInstellenProps) {
  const navigate = useNavigate();
  const { step = '1', action = 'instellen' } = useParams<{
    step: string;
    action: InstelAction;
  }>();

  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `voorkeur-${voorkeur?.id || ''}-${medium.type}`,
    medium.value ?? ''
  );

  const [emailFormActive, setEmailFormActive] = useState(true);

  const mediumUpdate: ContactgegevenFrontend = {
    ...medium,
    value: emailLocal,
  };

  const emailValue = medium.value || '';

  function navigateToStep(step: '1' | '2') {
    const path = voorkeur
      ? themaConfig.detailPageCommunicatievoorkeurInstellen.route.path
      : themaConfig.detailPageCommunicatieMediumInstellen.route.path;

    navigate(
      generatePath(path, {
        medium: mediumUpdate.type,
        id: voorkeur?.id,
        step,
        action: 'instellen',
      })
    );
  }

  return (
    <>
      {step === '1' && (
        <>
          {!!voorkeur && (
            <>
              <Paragraph className="ams-mb-m">
                Hier kunt u uw e-mailadres doorgeven. U krijgt dan e-mails van{' '}
                {voorkeur.dienstNaam} over de volgende onderwerpen:
              </Paragraph>
              <UnorderedList className="ams-mb-m">
                <UnorderedList.Item>
                  {voorkeur.dienstBeschrijving}
                </UnorderedList.Item>
              </UnorderedList>
              {!!medium.value && (
                <Field className="ams-mb-m">
                  <Label>
                    Wilt u deze informatie per{' '}
                    {VoorkeurByTypeLabels[mediumUpdate.type]} ontvangen?
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
                          <MaLinkLikeButton
                            onClick={() => setEmailFormActive(true)}
                          >
                            Wijzigen
                          </MaLinkLikeButton>
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
          {emailFormActive && (
            <EmailForm
              onSubmit={({ email }) => {
                setEmailLocal(email);
                navigateToStep('2');
              }}
              email={action === 'wijzigen' ? '' : emailValue}
            />
          )}
        </>
      )}
      {step === '2' && (
        <EmailVerify
          email={emailLocal}
          onValidated={({ otp, email }) => {
            setEmailLocal('');
            onFinished(email);
          }}
        />
      )}
    </>
  );
}
