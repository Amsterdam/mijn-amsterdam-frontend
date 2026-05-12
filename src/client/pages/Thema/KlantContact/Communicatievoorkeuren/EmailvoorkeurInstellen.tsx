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
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact-profieldienst-types.ts';
import { MaButtonInline } from '../../../../components/MaLink/MaLink.tsx';
import { useSessionStorage } from '../../../../hooks/storage.hook.ts';
import { routeConfig } from '../KlantContact-thema-config.ts';

type EmailInstellenProps = {
  medium: CommunicatieMedium;
  voorkeur?: Communicatievoorkeur | null;
  onFinished: (email: string) => void;
};

export function EmailInstellen({
  medium,
  voorkeur,
  onFinished,
}: EmailInstellenProps) {
  const navigate = useNavigate();
  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `voorkeur-${voorkeur?.id || ''}-${medium.type}`,
    medium.value ?? ''
  );

  const [emailFormActive, setEmailFormActive] = useState(true);

  const { step = '1' } = useParams<{ step: string }>();

  console.log('step', step);

  const medium_: CommunicatieMedium = {
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
                <UnorderedList.Item>{voorkeur.description}</UnorderedList.Item>
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
          {emailFormActive && (
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
  );
}
