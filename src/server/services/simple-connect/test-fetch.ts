import { fetchBelastingen } from './belastingen';
import uid from 'uid-safe';

const [id] = process.argv.slice(2);

fetchBelastingen(uid.sync(18), {
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
