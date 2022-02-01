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
      addListener: function () {},
      removeListener: function () {},
    };
  };
