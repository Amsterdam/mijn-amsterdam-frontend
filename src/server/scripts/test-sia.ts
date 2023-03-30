import { fetchSignals } from '../services/sia';

const [id] = process.argv.slice(2);

fetchSignals('xxx', {
  profile: {
    id,
    authMethod: 'yivi',
    profileType: 'private-attributes',
  },
  token: '',
}).then(
  (r) => {
    console.log(r);
  },
  (err) => {
    console.error(err);
  }
);
