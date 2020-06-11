const looksSame = require('looks-same');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'screenshots', 'prod-based');
const dir2 = path.join(__dirname, 'screenshots', 'bff-based');
const dir3 = path.join(__dirname, 'screenshots', 'diff');

const files = fs.readdirSync(dir).filter(item => item.endsWith('.png'));

(async function() {
  for (const fileName of files) {
    const baseImg = path.join(dir, fileName);
    const compareImg = path.join(dir2, fileName);
    const diffImg = path.join(dir3, fileName);

    // looksSame(baseImg, compareImg, (error, rs) => {
    //   console.log(rs);
    // });
    await new Promise(resolve => {
      looksSame.createDiff(
        {
          reference: baseImg,
          current: compareImg,
          diff: diffImg,
          highlightColor: '#ff00ff', // color to highlight the differences
          strict: false, // strict comparsion
          tolerance: 2.5,
          antialiasingTolerance: 0,
          ignoreAntialiasing: true, // ignore antialising by default
          ignoreCaret: true, // ignore caret by default
        },
        function(error) {
          resolve();
          console.log(error);
        }
      );
    });
  }
})();
