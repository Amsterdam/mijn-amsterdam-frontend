import { generatePath, useNavigate, useParams } from 'react-router';
import { useSetRecoilState } from 'recoil';

import { EmailInput, EmailOTP } from './EmailVoorkeur';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../../components/Page/Page';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { routeConfig } from '../Contact-thema-config';
import {
  useCommunicatieVoorkeurInstellen,
  voorkeurenAtom,
} from './useCommunicatieVoorkeuren';
import { useSessionStorage } from '../../../../hooks/storage.hook';

type MediumInstellenProps = {
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
};

function MediumInstellen({ medium, voorkeur }: MediumInstellenProps) {
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

  function navigateToStep(path: string, step: '1' | '2') {
    navigate(
      generatePath(path, {
        medium: medium.name,
        id: voorkeur.id,
        step,
      })
    );
  }

  return (
    <>
      {medium?.name === 'e-mail' && (
        <>
          {step === '1' && (
            <EmailInput
              onSubmit={(event) => {
                event.preventDefault();
                const email = new FormData(event.target as HTMLFormElement).get(
                  'email'
                ) as string;
                setEmailLocal(email);
                navigateToStep(
                  routeConfig.detailPageCommunicatievoorkeurInstellen.path,
                  '2'
                );
              }}
              medium={medium_}
              voorkeur={voorkeur}
            />
          )}
          {step === '2' && (
            <EmailOTP
              medium={medium_}
              onSubmit={({ otp }) => {
                setVoorkeurenBE((voorkeuren) => {
                  return [...voorkeuren].map((v) => {
                    if (v.id === voorkeur.id) {
                      return {
                        ...v,
                        medium: v.medium.map((m) => {
                          if (m.name === medium.name) {
                            return { ...m, value: emailLocal };
                          }
                          return m;
                        }),
                      };
                    }
                    return v;
                  });
                });
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
  const { voorkeur, medium, isLoading, isError, title, themaId, breadcrumbs } =
    useCommunicatieVoorkeurInstellen();
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
        <PageContentCell>
          {medium && voorkeur ? (
            <MediumInstellen voorkeur={voorkeur} medium={medium} />
          ) : (
            <MaRouterLink
              href={routeConfig.listPageCommunicatievoorkeuren.path}
            >
              Niet in te stellen
            </MaRouterLink>
          )}
        </PageContentCell>
      }
    />
  );
}
