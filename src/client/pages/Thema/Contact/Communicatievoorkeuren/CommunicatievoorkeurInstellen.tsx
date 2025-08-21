import { Paragraph } from '@amsterdam/design-system-react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { useSetRecoilState } from 'recoil';

import { EmailForm, EmailOTP } from './EmailVoorkeur';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../../components/Page/Page';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { routeConfig, themaTitle } from '../Contact-thema-config';
import {
  useCommunicatieVoorkeurInstellen,
  voorkeurenAtom,
} from './useCommunicatieVoorkeuren';
import { useSessionStorage } from '../../../../hooks/storage.hook';

type MediumInstellenProps = {
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
  emails: string[];
  phoneNumbers: string[];
};

function MediumInstellen({
  medium,
  voorkeur,
  emails,
  phoneNumbers,
}: MediumInstellenProps) {
  const navigate = useNavigate();
  // TODO: Deze naar een hook verplaatsen en koppelen aan backend?
  const [emailLocal, setEmailLocal] = useSessionStorage(
    `voorkeur-${voorkeur.id}-${medium.name}`,
    medium.value ?? ''
  );
  const setVoorkeurenBE = useSetRecoilState(voorkeurenAtom);
  const { step = '1' } = useParams<{ step: string }>();

  const medium_: CommunicatieMedium = {
    ...medium,
    value: emailLocal || medium.value,
  };

  function navigateToVoorkeur() {
    navigate(
      generatePath(routeConfig.detailPageCommunicatievoorkeur.path, {
        id: voorkeur.id,
      })
    );
  }

  function navigateToStep(step: '1' | '2') {
    navigate(
      generatePath(routeConfig.detailPageCommunicatievoorkeurInstellen.path, {
        medium: medium.name,
        id: voorkeur.id,
        step,
      })
    );
  }

  function updateEmailValue(email: string) {
    setVoorkeurenBE((voorkeuren) => {
      return [...voorkeuren].map((v) => {
        if (v.id === voorkeur.id) {
          return {
            ...v,
            medium: v.medium.map((m) => {
              if (m.name === medium.name) {
                return { ...m, value: email, isActive: true };
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
      {medium?.name === 'e-mail' && (
        <>
          {step !== '1' && step !== '2' && (
            <Paragraph>
              <MaRouterLink href={routeConfig.themaPage.path}>
                Ga terug naar {themaTitle}
              </MaRouterLink>
            </Paragraph>
          )}
          {step === '1' && (
            <>
              <EmailForm
                emails={emails}
                onSubmit={({ email, isVerified }) => {
                  if (!isVerified) {
                    setEmailLocal(email);
                    navigateToStep('2');
                  } else {
                    updateEmailValue(email);
                    navigateToVoorkeur();
                  }
                }}
                medium={medium_}
                voorkeur={voorkeur}
              />
            </>
          )}
          {step === '2' && (
            <EmailOTP
              medium={medium_}
              onSubmit={({ otp }) => {
                updateEmailValue(emailLocal);
                setEmailLocal('');
                navigateToVoorkeur();
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
    emails,
    phoneNumbers,
  } = useCommunicatieVoorkeurInstellen();
  useHTMLDocumentTitle(routeConfig.detailPageCommunicatievoorkeurInstellen);

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaId}
      isLoading={isLoading}
      isError={isError}
      zaak={voorkeur}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        <PageContentCell spanWide={8}>
          {medium && voorkeur ? (
            <MediumInstellen
              voorkeur={voorkeur}
              medium={medium}
              emails={emails}
              phoneNumbers={phoneNumbers}
            />
          ) : (
            <MaRouterLink href={routeConfig.themaPage.path}>
              Niets in te stellen. Ga terug naar {themaTitle}
            </MaRouterLink>
          )}
        </PageContentCell>
      }
    />
  );
}
