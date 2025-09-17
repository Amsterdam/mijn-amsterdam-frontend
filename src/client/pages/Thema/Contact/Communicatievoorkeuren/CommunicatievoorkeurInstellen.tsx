import { useState } from 'react';

import {
  Field,
  Label,
  Paragraph,
  Switch,
  UnorderedList,
} from '@amsterdam/design-system-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useSetRecoilState } from 'recoil';

import { VoorkeurByTypeLabels } from './CommunicatieVoorkeuren-config';
import styles from './CommunicatieVoorkeuren.module.scss';
import { EmailForm, EmailOTP } from './EmailVoorkeur';
import {
  CommunicatieMediumSetting,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaButtonInline } from '../../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../../components/Page/Page';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { routeConfig } from '../Contact-thema-config';
import {
  useCommunicatieVoorkeurInstellen,
  voorkeurenAtom,
} from './useCommunicatieVoorkeuren';
import { useSessionStorage } from '../../../../hooks/storage.hook';
import { Communicatievoorkeur as C2 } from '../../Profile/private/Communicatievoorkeur/Communicatievoorkeur';

type MediumInstellenProps = {
  medium: CommunicatieMediumSetting;
  voorkeur: Communicatievoorkeur | null;
  defaultValue: string | null;
};

function MediumInstellen({
  medium,
  voorkeur,
  defaultValue,
}: MediumInstellenProps) {
  const navigate = useNavigate();
  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `voorkeur-${voorkeur?.id || ''}-${medium.type}`,
    medium.value ?? ''
  );

  const [emailFormActive, setEmailFormActive] = useState(false);

  const setVoorkeurenBE = useSetRecoilState(voorkeurenAtom);
  const { step = '1' } = useParams<{ step: string }>();

  const medium_: CommunicatieMediumSetting = {
    ...medium,
    value: emailLocal || medium.value || defaultValue,
  };

  const emailValue = medium.value || defaultValue;

  function navigateToThemaPage() {
    navigate(routeConfig.themaPage.path);
  }

  function navigateToStep(step: '1' | '2') {
    if (!voorkeur) {
      return;
    }
    navigate(
      generatePath(routeConfig.detailPageCommunicatievoorkeurInstellen.path, {
        medium: medium_.type,
        id: voorkeur.id,
        step,
      })
    );
  }

  function updateEmailValue(email: string | null) {
    setVoorkeurenBE((voorkeuren) => {
      return voorkeuren.map((v) => {
        if (v.id === voorkeur?.id) {
          return {
            ...v,
            settings: v.settings.map((m) => {
              if (m.type === medium_.type) {
                return { ...m, value: email };
              }
              return m;
            }),
          };
        }
        return v;
      });
    });
  }

  return (
    <>
      {medium?.type === 'email' && (
        <>
          {step === '1' && (
            <>
              {!!voorkeur && (
                <>
                  <Paragraph className="ams-mb-m">
                    Hier kunt u uw e-mailadres doorgeven. U krijgt dan e-mails
                    van {voorkeur.stakeholder} over de volgende onderwerpen:
                  </Paragraph>
                  <UnorderedList className="ams-mb-m">
                    <UnorderedList.Item>
                      {voorkeur.description}
                    </UnorderedList.Item>
                  </UnorderedList>
                  {(!!defaultValue || medium.value) && (
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
                            if (medium.value || defaultValue) {
                              updateEmailValue(
                                medium.value ? null : defaultValue
                              );
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
              {(!defaultValue || emailFormActive) && (
                <EmailForm
                  onSubmit={({ email, isVerified }) => {
                    if (!isVerified) {
                      setEmailLocal(email);
                      navigateToStep('2');
                    } else {
                      updateEmailValue(email);
                      navigateToThemaPage();
                    }
                  }}
                  medium={medium_}
                />
              )}
            </>
          )}
          {step === '2' && (
            <EmailOTP
              medium={medium_}
              onSubmit={({ otp }) => {
                updateEmailValue(emailLocal);
                setEmailLocal('');
                navigateToThemaPage();
              }}
            />
          )}
        </>
      )}
    </>
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
    defaultValue,
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
        <PageContentCell spanWide={8}>
          {medium ? (
            <MediumInstellen
              voorkeur={voorkeur}
              medium={medium}
              defaultValue={defaultValue}
            />
          ) : (
            <C2 doUpdate={true} onUpdate={() => navigateToThemaPage()} />
          )}
        </PageContentCell>
      }
    />
  );
}
