const fs = require('fs');
fs.rmSync('src/app/leads', { recursive: true, force: true });
const path = require('path');
const componentsDir = 'src/components/dashboard';
fs.readdirSync(componentsDir).forEach(file => {
  if (file.startsWith('Lead')) {
    fs.unlinkSync(path.join(componentsDir, file));
  }
});
fs.unlinkSync('src/app/actions/createLead.ts');
fs.unlinkSync('src/app/actions/updateLead.ts');
console.log('Deleted');
