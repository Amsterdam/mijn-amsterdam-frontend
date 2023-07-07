import { AuthProfileAndToken, signDevelopmentToken } from '../../helpers/app';
import {
  fetchBbz,
  fetchEAanvragen,
  fetchSpecificaties,
  fetchStadspas,
  fetchTonk,
  fetchTozo,
} from './api-service';

const BSN = '307741837';

const auth: AuthProfileAndToken = {
  profile: {
    id: BSN,
    authMethod: 'digid',
    profileType: 'private',
  },
  token: signDevelopmentToken('digid', BSN),
};

const reqid = 'xx-1-xx';

const error = (error: any) => console.log('error', error);
const success = (response: any) => console.log('response', response);

(async function () {
  console.log('fetchEAanvragen:');
  await fetchEAanvragen(reqid, auth).then(success, error);
  console.log('fetchSpecificaties:');
  await fetchSpecificaties(reqid, auth).then(success, error);
  console.log('fetchTonk:');
  await fetchTonk(reqid, auth).then(success, error);
  console.log('fetchTozo:');
  await fetchTozo(reqid, auth).then(success, error);
  console.log('fetchBbz:');
  await fetchBbz(reqid, auth).then(success, error);
  console.log('fetchStadspas:');
  await fetchStadspas(reqid, auth).then(success, error);
})();
