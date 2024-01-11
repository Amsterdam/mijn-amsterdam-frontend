import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import { fetchMilieuzone } from './cleopatra';

// const [profileType = 'private', id] = process.argv.slice(2);

const profileAndToken: AuthProfileAndToken = {
  profile: {
    profileType: 'private',
    id: '123460013',
    authMethod: 'digid',
  },
  token: 'xx',
};

fetchMilieuzone(`reqid-${Math.random()}`, profileAndToken)
  .then(console.log)
  .catch(console.error);
