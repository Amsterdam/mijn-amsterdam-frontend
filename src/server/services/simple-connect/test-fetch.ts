import { fetchBelasting } from './belasting';
import uid from 'uid-safe';

const [id] = process.argv.slice(2);

fetchBelasting(uid.sync(18), {
  token: 'xxxx',
  profile: {
    authMethod: 'digid',
    profileType: 'private',
    id,
  },
})
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.log(error);
  });
