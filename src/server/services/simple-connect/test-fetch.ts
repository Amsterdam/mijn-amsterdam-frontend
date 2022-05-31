import { fetchBelasting } from './belasting';
import uid from 'uid-safe';
import { fetchMilieuzone } from './milieuzone';
import { AuthProfileAndToken } from '../../helpers/app';

const [id] = process.argv.slice(2);

const requestID = uid.sync(18);
const authProfileAndToken: AuthProfileAndToken = {
  token: 'xxxx',
  profile: {
    authMethod: 'digid',
    profileType: 'private',
    id,
  },
};

fetchBelasting(requestID, authProfileAndToken)
  .then((response) => {
    console.log('Belasting', response);
  })
  .catch((error) => {
    console.log('Belasting', error);
  });

fetchMilieuzone(uid.sync(18), authProfileAndToken)
  .then((response) => {
    console.log('Milieuzone', response);
  })
  .catch((error) => {
    console.log('Milieuzone', error);
  });
