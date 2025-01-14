import { render, screen } from '@testing-library/react';
import { MutableSnapshot } from 'recoil';

import { ProfileName } from './ProfileName';
import { AppRoutes } from '../../../universal/config/routes';
import { AppState } from '../../../universal/types';
import {
  appStateAtom,
  appStateReadyAtom,
  useAppStateGetter,
} from '../../hooks/useAppState';
import MockApp from '../../pages/MockApp';

vi.mock('../../hooks/media.hook');

function testState(brp: any = null, profile: any = null, kvk: any = null) {
  const s = {
    BRP: {
      status: 'OK',
      content: brp,
    },
    PROFILE: { status: 'OK', content: profile },
    KVK: { status: 'OK', content: kvk },
  } as unknown as AppState;

  return (snapshot: MutableSnapshot) => {
    snapshot.set(appStateAtom, s);
    snapshot.set(appStateReadyAtom, true);
  };
}

function Wrapper({ profileType = 'private' }: { profileType: ProfileType }) {
  const state = useAppStateGetter();
  return (
    <ProfileName
      person={state.BRP.content?.persoon}
      company={state.KVK.content}
      profileAttribute={state.PROFILE.content?.profile?.id}
      profileType={profileType}
      showIcons
    />
  );
}

describe('<ProfileName />', () => {
  const routeEntry = AppRoutes.HOME;
  const routePath = AppRoutes.HOME;

  function Component({ profileType, brp, kvk, profile }: any) {
    return (
      <MockApp
        routeEntry={routeEntry}
        routePath={routePath}
        component={() => <Wrapper profileType={profileType} />}
        initializeState={testState(brp, profile, kvk)}
      />
    );
  }

  it('Shows BRP naam', () => {
    render(<Component brp={{ persoon: { opgemaakteNaam: 'J de grever' } }} />);
    expect(screen.getByText(/J de grever/)).toBeInTheDocument();
  });

  it('Shows KVK naam', () => {
    render(
      <Component
        kvk={{
          onderneming: {
            handelsnaam: 'Bedrijfsnaampje',
          },
        }}
        profileType="commercial"
      />
    );
    expect(screen.getByText(/Bedrijfsnaampje/)).toBeInTheDocument();
  });

  it('Shows Profile naam', () => {
    render(
      <Component
        profile={{
          profile: {
            id: 'test@some.thing',
          },
        }}
        profileType="private-attributes"
      />
    );
    expect(screen.getByText(/test@some.thing/)).toBeInTheDocument();
  });
});
