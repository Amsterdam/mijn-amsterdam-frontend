const data = require('../json/inkomen-specificaties.json');

module.exports = {
  path: '/api/focus/combined',
  // delay: 11000,
  template: (_, queryParams) => {
    const jaaropgaven = [];
    const uitkeringsspecificaties = [];

    data.forEach((item, index) => {
      if (index % 12 === 0) {
        jaaropgaven.push({
          ...item,
          title: 'Jaaropgave',
        });
      }
      uitkeringsspecificaties.push({
        ...item,
        isAnnualStatement: false,
      });
    });

    return {
      jaaropgaven,
      uitkeringsspecificaties,
    };
  },
};
