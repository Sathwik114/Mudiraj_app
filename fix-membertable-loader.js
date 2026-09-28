const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

const oldLoader = `<tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Loading member records from server...
                </td>
              </tr>`;

const newLoader = `Array.from({ length: 5 }).map((_, i) => (
                <tr key={\`skel-\${i}\`} style={{ opacity: 1 - (i * 0.15) }}>
                  <td data-label="Membership ID / App No"><div style={{ height: '14px', width: '60%', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '10px', width: '40%', background: 'var(--bg-muted)', borderRadius: '4px' }} /></td>
                  <td data-label="Member Name & Parentage"><div style={{ height: '14px', width: '80%', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '10px', width: '50%', background: 'var(--bg-muted)', borderRadius: '4px' }} /></td>
                  <td data-label="Mobile & Gender"><div style={{ height: '14px', width: '70%', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '10px', width: '80%', background: 'var(--bg-muted)', borderRadius: '4px' }} /></td>
                  <td data-label="District / Constitution / Mandal"><div style={{ height: '14px', width: '50%', background: 'var(--border-color)', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '10px', width: '90%', background: 'var(--bg-muted)', borderRadius: '4px', marginBottom: '6px' }} /><div style={{ height: '10px', width: '60%', background: 'var(--bg-muted)', borderRadius: '4px' }} /></td>
                  <td data-label="Leadership Role"><div style={{ height: '18px', width: '70px', background: 'var(--border-color)', borderRadius: '12px' }} /></td>
                  <td data-label="Status"><div style={{ height: '22px', width: '60px', background: 'var(--border-color)', borderRadius: '12px' }} /></td>
                  <td data-label="Actions" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}><div style={{ height: '28px', width: '28px', background: 'var(--border-color)', borderRadius: '4px' }} /></td>
                </tr>
              ))`;

code = code.replace(oldLoader, newLoader);

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('MemberTable loader replaced with skeletons.');
