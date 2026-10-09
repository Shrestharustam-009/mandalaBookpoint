const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("'http://localhost:3000'")) {
      content = content.replace(/'http:\/\/localhost:3000'/g, "'https://mandalabookpoint.com'");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
}

const files = [
  '../lib/email.js',
  '../app/api/payment/create/route.js',
  '../app/api/payment/generate-page/route.js',
  '../app/api/payment/test/route.js',
  '../app/api/payment/test-connection/route.js',
  '../config/siteConfig.js'
].map(f => path.join(__dirname, f));

files.forEach(replaceInFile);
console.log('Done');
