import { Request, Response } from 'express';

import {
  handleAdministratienummerExchange,
  sendAppLandingResponse,
  sendStadspassenResponse,
  sendDiscountTransactionsResponse,
  sendBudgetTransactionsResponse,
  sendStadspasBlockRequest,
} from './amsapp-stadspas-route-handlers';
import { routes } from './amsapp-stadspas-service-config';
import { RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER } from '../../../auth/auth-returnto-keys';
import { authRoutes } from '../../../auth/auth-routes';
import { apiKeyVerificationHandler } from '../../../routing/route-handlers';
import {
  createBFFRouter,
  generateFullApiUrlBFF,
} from '../../../routing/route-helpers';

// PUBLIC INTERNET NETWORK ROUTER
// ==============================
export const routerInternet = createBFFRouter({
  id: 'external-consumer-public-stadspas',
});

routerInternet.get(
  routes.public.STADSPAS_AMSAPP_LOGIN,
  async (req: Request<{ token: string }>, res: Response) => {
    return res.redirect(
      generateFullApiUrlBFF(authRoutes.AUTH_LOGIN_DIGID, [
        {
          returnTo: RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
          'amsapp-session-token': req.params.token,
        },
      ])
    );
  }
);

routerInternet.get(
  routes.public.STADSPAS_AMSAPP_EXCHANGE_ADMINISTRATIENUMMER,
  handleAdministratienummerExchange
);

routerInternet.get(
  routes.public.STADSPAS_AMSAPP_OPENER,
  sendAppLandingResponse
);

// PRIVATE NETWORK ROUTER
// ======================
export const routerPrivateNetwork = createBFFRouter({
  id: 'external-consumer-private-network-stadspas',
});

routerPrivateNetwork.get(
  routes.private.STADSPAS_PASSEN,
  apiKeyVerificationHandler,
  sendStadspassenResponse
);

routerPrivateNetwork.get(
  routes.private.STADSPAS_DISCOUNT_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendDiscountTransactionsResponse
);

routerPrivateNetwork.get(
  routes.private.STADSPAS_BUDGET_TRANSACTIONS,
  apiKeyVerificationHandler,
  sendBudgetTransactionsResponse
);

routerPrivateNetwork.post(
  routes.private.STADSPAS_BLOCK_PAS,
  apiKeyVerificationHandler,
  sendStadspasBlockRequest
);

export const stadspasRouterExternalConsumer = {
  public: routerInternet,
  private: routerPrivateNetwork,
};
