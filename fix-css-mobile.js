const fs = require('fs');
let css = fs.readFileSync('D:/Mudiraj_app/src/app/globals.css', 'utf8');

const mobileCSS = `
/* --- MOBILE UX IMPROVEMENTS --- */

.mobile-only-flex {
  display: none !important;
}

@media (max-width: 768px) {
  .hide-mobile {
    display: none !important;
  }
  .mobile-only-flex {
    display: inline-flex !important;
  }
  .hide-mobile-grid {
    display: none !important;
  }

  /* Table to Card Transformation */
  .table-container {
    border: none;
    background: transparent;
  }
  
  .data-table, .data-table thead, .data-table tbody, .data-table th, .data-table td, .data-table tr {
    display: block;
    width: 100%;
    min-width: 0 !important;
  }

  .data-table thead {
    display: none;
  }

  .data-table tr {
    margin-bottom: 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .data-table td {
    position: relative;
    padding-left: 45% !important;
    text-align: right !important;
    border: none;
    border-bottom: 1px solid var(--border-color);
    min-height: 44px; /* Touch target */
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .data-table td:last-child {
    border-bottom: 0;
  }

  .data-table td::before {
    content: attr(data-label);
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 40%;
    padding-right: 10px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* Fix specific alignments inside td */
  .data-table td > div {
    text-align: right;
  }
  
  /* Make the first cell (Member Name/ID) act as a card header */
  .data-table td:first-child {
    background: var(--bg-muted);
    border-bottom: 2px solid var(--border-color);
    padding-left: 16px !important;
    text-align: left !important;
    justify-content: flex-start;
  }
  .data-table td:first-child::before {
    display: none; /* Hide label for the header row */
  }
  .data-table td:first-child > div {
    text-align: left;
  }
}
`;

if (!css.includes('MOBILE UX IMPROVEMENTS')) {
  css += '\n' + mobileCSS;
  fs.writeFileSync('D:/Mudiraj_app/src/app/globals.css', css);
  console.log('Added mobile CSS to globals.css');
} else {
  console.log('Mobile CSS already exists.');
}
