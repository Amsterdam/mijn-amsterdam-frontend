import { AuthProfile, AuthProfileAndToken } from '../../helpers/app';
import { getConfigMain, fetchErfpacht } from './erfpacht';

const [profileType = 'private', id] = process.argv.slice(2);

const profileAndToken: AuthProfileAndToken = {
  profile: {
    profileType: profileType as AuthProfile['profileType'],
    id,
    authMethod: 'digid',
  },
  token: 'xx',
};

console.log(getConfigMain(profileAndToken));

console.log('fetching....');

fetchErfpacht(`reqid-${Math.random()}`, profileAndToken)
  .then(console.log)
  .catch(console.error);
