const uitkeringsspecificaties = require('../json/inkomen-specificaties.json');

module.exports = {
  path: '/api/focus/uitkeringsspecificaties',
  // delay: 11000,
  template: (_, queryParams) => {
    return uitkeringsspecificaties.map((item, index) => {
      if (index % 12 === 0) {
        return {
          ...item,
          title: 'Jaaropgave',
          isAnnualStatement: true,
        };
      }
      return {
        ...item,
        isAnnualStatement: false,
      };
    });
  },
};
