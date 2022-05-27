import { encryptPayload, fetchMilieuzone } from './milieuzone';
const [id] = process.argv.slice(2);

const payload = 'test 1 2 3';

console.log('result payload', encryptPayload(payload));

fetchMilieuzone('xxxx111', {
  profile: { id, authMethod: 'digid', profileType: 'private' },
  token: '',
})
  .then((r) => console.log('mzone', r))
  .catch((error) => console.log('mzoneerrr', error));
