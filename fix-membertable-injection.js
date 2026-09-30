const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

const badBlock = `  const renderCell = (row, col) => {
    switch (col.key) {
      case 'memberInfo':
      
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

const fixedRenderCell = `  const renderCell = (row, col) => {
    switch (col.key) {
      case 'memberInfo':
        return (`;

code = code.replace(badBlock, fixedRenderCell);

const mainReturnMatch = code.match(/  return \(\s*<div className="members-page-wrapper">/);

if (mainReturnMatch) {
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

  return (
    <div className="members-page-wrapper">`;
    
  code = code.replace(mainReturnMatch[0], tableDataHook);
} else {
  console.log('Could not find main return statement.');
}

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('Fixed MemberTable tableData injection.');
