const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

if (!code.includes('useMemo')) {
  code = code.replace(/import \{([^}]+)\} from ['"]react['"];?/, (match, p1) => {
    return `import {${p1}, useMemo} from 'react';`;
  });
}

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
  
code = code.replace('  return (', tableDataHook);
code = code.replace('data={items}', 'data={tableData}');

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('MemberTable updated with tableData mapping.');
