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
process.env.BFF_ENABLE_MOCK_ADAPTER = 'false';
process.env.BFF_REQUEST_CACHE_ENABLED = 'false';
process.env.BFF_MS_API_BASE_URL = 'http://localhost/remote/api';
