const fs = require('fs');
const path = 'D:/Mudiraj_app/src/components/MemberTable.jsx';
let content = fs.readFileSync(path, 'utf8');

const replacementContent = `              {/* Digital Membership Card Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                  color: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                  borderBottom: '4px solid var(--accent)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {selectedMember.photoUrl ? (
                    <img
                      src={selectedMember.photoUrl}
                      alt={selectedMember.fullName}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '3px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <span style={{ fontSize: '28px', color: '#fff', fontWeight: 'bold' }}>
                        {selectedMember.fullName ? selectedMember.fullName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '11px', color: '#fde68a', fontWeight: 700, letterSpacing: '0.5px' }}>
                      ANDHRA PRADESH MUDIRAJ COMMUNITY
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {selectedMember.fullName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#dbeafe', marginTop: '2px' }}>
                      {[selectedMember.gramamName, selectedMember.mandalName, selectedMember.districtName].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600, letterSpacing: '0.5px' }}>MEMBERSHIP ID</div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      background: 'rgba(255,255,255,0.15)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      marginTop: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'inline-block'
                    }}
                  >
                    {selectedMember.membershipId || 'PENDING APPROVAL'}
                  </div>
                  {(selectedMember.memberPassword || selectedMember.password) && (
                    <div style={{ fontSize: '12px', color: '#fde68a', marginTop: '8px', fontWeight: 700 }}>
                      Password: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>{selectedMember.memberPassword || selectedMember.password}</code>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', fontSize: '13px' }}>
                {[
                  { label: 'Father Name', value: selectedMember.fatherName || '—' },
                  { label: 'Mother Name', value: selectedMember.motherName || '—' },
                  { label: 'Date of Birth / Gender', value: \`\${selectedMember.dob || '—'} (\${selectedMember.gender || '—'})\` },
                  { label: 'Primary Mobile', value: selectedMember.mobile || '—' },
                  { label: 'Alternate Mobile', value: selectedMember.alternateMobile || '—' },
                  { label: 'Email', value: selectedMember.email || '—' },
                  { 
                    label: 'Residential Address', 
                    value: (
                      <>
                        {[
                          selectedMember.houseNo ? \`H.No \${selectedMember.houseNo}\` : '',
                          selectedMember.street,
                          selectedMember.gramamName,
                          selectedMember.mandalName,
                          selectedMember.constitutionName ? \`\${selectedMember.constitutionName} Constitution\` : '',
                          selectedMember.districtName ? \`\${selectedMember.districtName} District\` : '',
                          selectedMember.stateName,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                        {selectedMember.pincode ? \` - \${selectedMember.pincode}\` : ''}
                      </>
                    ),
                    fullWidth: true
                  },
                  { label: 'Government ID Type', value: selectedMember.idType || '—' },
                  { 
                    label: 'Government ID Number', 
                    value: selectedMember.idNumber ? <code style={{ fontWeight: 700, padding: '2px 6px', background: 'var(--bg-muted, #f1f5f9)', borderRadius: '4px', border: '1px solid var(--border-color, #e2e8f0)' }}>{selectedMember.idNumber}</code> : '—'
                  },
                  { 
                    label: 'Application Date', 
                    value: selectedMember.applicationDate ? new Date(selectedMember.applicationDate).toLocaleString() : '—' 
                  },
                  { 
                    label: 'Approval Date', 
                    value: selectedMember.approvalDate ? new Date(selectedMember.approvalDate).toLocaleString() : 'Not Yet Approved' 
                  },
                  { 
                    label: 'Sponsored By (Membership ID)', 
                    value: selectedMember.sponsorId ? <span className="badge badge-info">{selectedMember.sponsorId}</span> : '—' 
                  },
                  { label: 'Remarks', value: selectedMember.remarks || '—', fullWidth: true },
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    gridColumn: item.fullWidth ? '1 / -1' : 'auto',
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ color: 'var(--text-secondary, #64748b)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-main, #0f172a)', lineHeight: '1.4' }}>{item.value}</div>
                  </div>
                ))}
              </div>
`;

const startMarker = '              {/* Digital Membership Card Banner */}';
const endMarker = '            </div>\\r\\n\\r\\n            <div className="modal-footer">';
const endMarker2 = '            </div>\\n\\n            <div className="modal-footer">';

let startIndex = content.indexOf(startMarker);
let endIndex = content.indexOf('            </div>\\r\\n\\r\\n            <div className="modal-footer">'.replace(/\\\\/g, ''));
if(endIndex === -1) endIndex = content.indexOf('            </div>\\n\\n            <div className="modal-footer">'.replace(/\\\\/g, ''));

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + replacementContent + content.substring(endIndex);
    fs.writeFileSync(path, newContent, 'utf8');
    console.log('Success via slice!');
} else {
    console.log('Markers not found. start:', startIndex, 'end:', endIndex);
}
