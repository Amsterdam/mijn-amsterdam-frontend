const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'screenshots', 'prod-based');
const files = fs.readdirSync(dir).filter(item => item.endsWith('.png'));

let output = '<!doctype html><html><ul>';

for (const fileName of files) {
  output += `<li style="border-bottom: 1px solid #000;">
    <h3>${fileName}</h3>
    <div style="display: flex">
    <img src="./prod-based/${fileName}"/>
    <img src="./diff/${fileName}"/>
    <img src="./bff-based/${fileName}"/>
    </div>
  </li>`;
}

output += '</ul></html>';

fs.writeFileSync(path.join(__dirname, 'screenshots', 'gallery.html'), output);
