import { fetchErfpacht } from './erfpacht';
import { encryptPayload, fetchMilieuzone } from './milieuzone';
const [id] = process.argv.slice(2);

const payload = 'test 1 2 3';

try {
  console.log('result payload', encryptPayload(payload));
} catch (err) {
  console.log('errrrr', err);
}

fetchMilieuzone('xxxx111', {
  profile: { id, authMethod: 'digid', profileType: 'private' },
  token: '',
})
  .then((r) => console.log('mzone', r))
  .catch((error) => console.log('mzoneerrr', error));

fetchErfpacht('xxxx111', {
  profile: { id, authMethod: 'digid', profileType: 'private' },
  token: '',
})
  .then((r) => console.log('erff', r))
  .catch((error) => console.log('erfferrr', error));
