const fs = require('fs');
let css = fs.readFileSync('D:/Mudiraj_app/src/app/globals.css', 'utf8');

const cssRules = `
.advanced-filters-wrapper {
  display: contents;
}
@media (max-width: 768px) {
  .advanced-filters-wrapper {
    display: flex !important;
    flex-direction: column;
    gap: 16px;
    grid-column: 1 / -1;
  }
}
`;

if (!css.includes('.advanced-filters-wrapper {')) {
  css += '\n' + cssRules;
  fs.writeFileSync('D:/Mudiraj_app/src/app/globals.css', css);
  console.log('Added advanced-filters-wrapper to CSS');
}
