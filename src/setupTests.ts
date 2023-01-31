import axios from 'axios';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Configure axios to use the node adapter.
axios.defaults.adapter = require('axios/lib/adapters/http');

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };

process.env.BFF_FRONTEND_URL = 'http://test-host';
process.env.BFF_ENABLEU_2_SMILE_ENDPOINT = 'http://localhost/smile';
process.env.BFF_OIDC_BASE_URL = 'http://localhost/bff';
process.env.BFF_MIJN_ERFPACHT_API_KEY = 'foo-bar-123';
process.env.BFF_MIJN_ERFPACHT_ENCRYPTION_KEY_V2 = 'xxxxxxxxxxxxxxxx';
process.env.BFF_MIJN_ERFPACHT_API_URL = 'http://localhost/erfpacht';
process.env.BFF_LVV_API_URL = '/remote/lvv/api';
process.env.BFF_SMILE_USERNAME = 'test2';
process.env.BFF_SMILE_PASSWORD = 'testpwd2';
process.env.BFF_SISA_ENCRYPTION_KEY = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_CLIENT_SECRET = 'xxxxxxxxxxxxxxxx';
process.env.BFF_SISA_API_ENDPOINT = 'http://localhost/remote/subsidies/api/';
process.env.BFF_ENABLE_MOCK_ADAPTER = 'false';
process.env.BFF_REQUEST_CACHE_ENABLED = 'false';
process.env.BFF_MS_API_BASE_URL = 'http://localhost/remote/api';
process.env.BFF_WMO_API_BASE_URL = 'http://localhost/remote/api';
process.env.BFF_WPI_API_BASE_URL = 'http://localhost/remote/api';
process.env.BFF_VERGUNNINGEN_API_BASE_URL = 'http://localhost/remote/api';
process.env.BFF_MKS_API_BASE_URL = 'http://localhost/remote/api';
process.env.BFF_KREFIA_API_BASE_URL = 'http://localhost/remote/api';
