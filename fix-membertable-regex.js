const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

const tableDataHook = `
  const tableData = useMemo(() => {
    return items.map(item => ({
      ...item,
      memberInfo: item.membershipId || item.applicationNo || '',
      name: \`\${item.fullName || ''} \${item.fatherName || ''}\`.trim(),
      contact: \`\${item.mobile || ''} \${item.gender || ''}\`.trim(),
      location: \`\${item.districtName || ''} \${item.constitutionName || ''} \${item.mandalName || ''} \${item.gramamName || ''}\`.trim(),
      role: item.leadershipPositions?.length ? item.leadershipPositions.map(p => p.positionTitle).join(', ') : 'General Member',
    }));
  }, [items]);

  return (`;

code = code.replace(/\s*return \(\s*<div className="card">/, '\n' + tableDataHook + '\n    <div className="card">');

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('Fixed MemberTable tableData injection via regex file.');
