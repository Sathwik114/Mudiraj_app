const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/app/admin/members/page.jsx', 'utf8');

code = code.replace('<button\n          type="button"\n          className="btn btn-primary"', 
  '<button\n          type="button"\n          className="btn btn-primary mobile-fab"');

fs.writeFileSync('D:/Mudiraj_app/src/app/admin/members/page.jsx', code);

let css = fs.readFileSync('D:/Mudiraj_app/src/app/globals.css', 'utf8');
const fabCss = `
@media (max-width: 768px) {
  .mobile-fab {
    position: fixed !important;
    bottom: 24px;
    right: 24px;
    z-index: 100;
    border-radius: 50px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    padding: 12px 20px !important;
  }
}`;
if (!css.includes('.mobile-fab {')) {
  fs.writeFileSync('D:/Mudiraj_app/src/app/globals.css', css + '\n' + fabCss);
}
console.log('Added FAB styling.');
