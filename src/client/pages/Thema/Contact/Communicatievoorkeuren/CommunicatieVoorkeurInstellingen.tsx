import { Alert, Paragraph, Switch } from '@amsterdam/design-system-react';
import { generatePath, useNavigate } from 'react-router';
import { useSetRecoilState } from 'recoil';

import {
  communicatieVoorkeurenTitle,
  communicatievoorkeurInstellenDisplayProps,
  type CommunicatievoorkeurFrontend,
} from './CommunicatieVoorkeuren-config';
import { EmailValue } from './EmailVoorkeur';
import { voorkeurenAtom } from './useCommunicatieVoorkeuren';
import type {
  CommunicatieMedium,
  Communicatievoorkeur,
} from '../../../../../server/services/contact/contact.types';
import { MaRouterLink } from '../../../../components/MaLink/MaLink';
import { TableV2 } from '../../../../components/Table/TableV2';
import { routeConfig } from '../Contact-thema-config';
import { AdresValue } from './AdresVoorkeur';
import { SMSValue } from './SMSVoorkeur';

type MediumValueProps = {
  medium: CommunicatieMedium;
  voorkeur: Communicatievoorkeur;
};

function MediumValue({ medium, voorkeur }: MediumValueProps) {
  const navigate = useNavigate();

  switch (medium.name) {
    case 'e-mail':
      return (
        <EmailValue
          onClick={() =>
            navigate(
              generatePath(
                routeConfig.detailPageCommunicatievoorkeurInstellen.path,
                { medium: medium.name, id: voorkeur.id, step: '1' }
              )
            )
          }
          medium={medium}
        />
      );
    // Add more cases for other communication mediums
    case 'brieven per post':
      // return <PostalMailSettingModal medium={medium} />;
      return <AdresValue medium={medium} onClick={() => {}} />;
    case 'sms':
      // return <SmsSettingModal medium={medium} />;
      return <SMSValue medium={medium} onClick={() => {}} />;
    default:
      return null;
  }
}

export function CommunicatievoorkeurInstellingen({
  voorkeur,
}: {
  voorkeur: Communicatievoorkeur;
}) {
  const navigate = useNavigate();
  const setVoorkeurenBE = useSetRecoilState(voorkeurenAtom);

  const voorkeur_: CommunicatievoorkeurFrontend | null = voorkeur
    ? {
        ...voorkeur,
        medium_: voorkeur?.medium.map((medium) => ({
          ...medium,
          value_: <MediumValue voorkeur={voorkeur} medium={medium} />,
          isActive_: (
            <Switch
              title={
                medium.isActive
                  ? 'Klik om uit te schakelen'
                  : 'Klik om in te schakelen'
              }
              onChange={(x) => {
                // Update backend
                setVoorkeurenBE((voorkeuren) => {
                  return [...voorkeuren].map((v) => {
                    if (v.id === voorkeur.id) {
                      return {
                        ...v,
                        medium: v.medium.map((m) => {
                          if (m.name === medium.name) {
                            const isActive = !m.isActive;
                            return {
                              ...m,
                              isActive,
                            };
                          }
                          return m;
                        }),
                      };
                    }
                    return v;
                  });
                });
                if (!medium.isActive && !medium.value) {
                  // If the medium is not active, we need to navigate to the detail page
                  navigate(
                    generatePath(
                      routeConfig.detailPageCommunicatievoorkeurInstellen.path,
                      {
                        id: voorkeur.id,
                        medium: medium.name,
                        step: '1',
                      }
                    )
                  );
                }
              }}
              checked={medium.isActive}
            />
          ),
        })),
      }
    : null;

  const rows = voorkeur_?.medium_.map((medium) => {
    return {
      label: (
        <div style={{ display: 'flex' }}>
          {medium.isActive_} {medium.name}
        </div>
      ),
      content: <>{medium.value_}</>,
    };
  });

  return (
    <>
      {voorkeur_ ? (
        <>
          <TableV2
            items={voorkeur_.medium_}
            className="ams-mb-m"
            displayProps={communicatievoorkeurInstellenDisplayProps}
          />
          {/* {!!rows && <Datalist rows={rows} />} */}
          {!voorkeur.medium.some((m) => m.isActive) && (
            <Alert
              className="ams-mb-m"
              heading="Geen voorkeuren doorgegeven."
              severity="warning"
              headingLevel={4}
            >
              <Paragraph>
                Er zijn op dit moment geen voorkeuren actief voor dit
                onderwerp.{' '}
              </Paragraph>
              <Paragraph>
                Dit betekent dat wij u geen brieven, e-mails of sms-berichten
                sturen over dit onderwerp.
              </Paragraph>
              <Paragraph>
                U kunt uw voorkeuren instellen door op de{' '}
                <strong>Actief</strong> knop te klikken.
              </Paragraph>
            </Alert>
          )}
        </>
      ) : (
        <Paragraph>Geen communicatievoorkeuren in te stellen.</Paragraph>
      )}
      <Paragraph>
        <MaRouterLink href={routeConfig.themaPage.path}>
          Terug naar {communicatieVoorkeurenTitle}
        </MaRouterLink>
      </Paragraph>
    </>
  );
}
