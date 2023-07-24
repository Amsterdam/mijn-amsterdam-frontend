import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { getDataForLood365, getLoodApiHeaders } from './loodmetingen';
import { LoodMetingen } from './types';

const authProfileAndToken: AuthProfileAndToken = {
  token: '',
  profile: {
    id: '303937828',
    authMethod: 'digid',
    profileType: 'private',
  },
};

(async function () {
  const data = getDataForLood365(authProfileAndToken);
  const requestConfig = getApiConfig('LOOD_365', {
    headers: await getLoodApiHeaders('1xxx1'),
    data,
  });
  requestConfig.url = `${requestConfig.url}/be_getrequestdetails`;

  const res = await requestData<LoodMetingen>(requestConfig, '1xxx1');
  console.log(res);
})();
