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

process.env.MA_FE_URL = 'http://test-host';
process.env.BFF_ENABLEU_2_SMILE_ENDPOINT = 'http://localhost/smile';
process.env.BFF_OIDC_BASE_URL = 'http://localhost/bff';
