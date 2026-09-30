const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

code = code.replace('<table className="data-table">', '<table className="data-table" style={{ minWidth: "1000px" }}>');

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('Added minWidth to table.');
