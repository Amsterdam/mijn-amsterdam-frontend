import { apiSuccessResult } from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { HLIRegeling } from './regelingen-types';
import { Stadspas, StadspasAdministratieNummer } from './stadspas-types';

export async function fetchHLI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const regelingen: HLIRegeling[] = [];
  const stadspassen: Stadspas[] = [];
  const administratienummer: StadspasAdministratieNummer | null = null;

  return apiSuccessResult({
    regelingen,
    stadspassen,
    administratienummer,
  });
}
