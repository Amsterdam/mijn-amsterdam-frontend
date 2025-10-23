import { IS_PRODUCTION } from '../../../universal/config/env';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { createBFFRouter, sendResponse } from '../../routing/route-helpers';

const afisTempRouterPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-afis-temp',
  isEnabled: !IS_PRODUCTION,
});

afisTempRouterPrivateNetwork.post(
  '/services/afis/e-mandates/sign-request-status-notify',
  (req, res) => {
    return sendResponse(res, apiSuccessResult(req.body));
  }
);

export const afisTempRouter = {
  private: afisTempRouterPrivateNetwork,
};
