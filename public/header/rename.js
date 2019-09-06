const fs = require('fs');

const files = fs.readdirSync('./');

files
  // .filter(f => f.includes('_') && !f.startsWith('.'))
  .forEach(fileName => {
    const nFileName = fileName.replace(
      /(-MEDIUM|-LARGE|-SMALL|-1X|-2X|-3X)/gi,
      ''
    );
    console.log(nFileName);
    fs.renameSync('./' + fileName, './' + nFileName.toLocaleLowerCase());
  });
