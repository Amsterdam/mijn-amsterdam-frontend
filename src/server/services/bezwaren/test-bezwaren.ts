import { getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { fetchBezwaren, getBezwarenApiHeaders } from './bezwaren';
import { BezwaarResponse } from './types';

// fetchBezwaren('xxxxxx11', {
//   token: '',
//   profile: {
//     id: '999991619',
//     profileType: 'private',
//     authMethod: 'digid',
//   },
// }).then(console.log, console.error);

(async function test() {
  const authProfileAndToken: AuthProfileAndToken = {
    token: '',
    profile: {
      id: '999991619',
      profileType: 'private',
      authMethod: 'digid',
    },
  };

  const requestBody = JSON.stringify({
    rol__betrokkeneIdentificatie__natuurlijkPersoon__inpBsn:
      authProfileAndToken.profile.id,
  });

  const params = {
    page: 1,
    pageSize: 50,
  };
  const requestConfig = getApiConfig('BEZWAREN_LIST', {
    data: requestBody,
    params,
    headers: await getBezwarenApiHeaders(authProfileAndToken),
  });
  let bezwarenResponse = await requestData<BezwaarResponse>(
    requestConfig,
    'xxxxxx111111'
  ).then(console.log, console.error);
})();
