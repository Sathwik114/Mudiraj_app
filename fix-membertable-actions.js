const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

// Add import
if (!code.includes('DropdownMenu')) {
  const importToAdd = `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';\nimport { MoreHorizontal } from 'lucide-react';\n`;
  code = code.replace(/import \{[^}]*\} from 'lucide-react';/, (match) => {
    return match + '\n' + importToAdd;
  });
}

// Replace the Actions div
const oldActions = `<div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(member.status === 'Pending' || showApplicationActions) &&
                        member.status !== 'Active' && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            title="Approve & Generate Membership ID"
                            onClick={() => handleApprove(member)}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}

                      {member.status === 'Pending' && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          title="Reject Application"
                          onClick={() => {
                            setRejectModalMember(member);
                            setRejectRemarks('');
                          }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      )}

                      {member.status === 'Rejected' && showApplicationActions && (
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          title="Revoke Rejection"
                          onClick={() => handleRevoke(member)}
                        >
                          <RefreshCw size={14} /> Revoke
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="View Complete Profile"
                        onClick={() => setSelectedMember(member)}
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        title="Edit Member / Status"
                        onClick={() => setEditingMember({ ...member })}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        title="Delete Member"
                        onClick={() => handleDelete(member)}
                      >
                        <XCircle size={14} /> Delete
                      </button>
                    </div>`;

const newActions = `<DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }}>
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white" style={{ minWidth: '160px', zIndex: 50 }}>
                        {(member.status === 'Pending' || showApplicationActions) && member.status !== 'Active' && (
                          <DropdownMenuItem onClick={() => handleApprove(member)} style={{ color: 'var(--success)', cursor: 'pointer' }}>
                            <CheckCircle size={14} style={{ marginRight: '8px' }} /> Approve
                          </DropdownMenuItem>
                        )}
                        {member.status === 'Pending' && (
                          <DropdownMenuItem onClick={() => { setRejectModalMember(member); setRejectRemarks(''); }} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                            <XCircle size={14} style={{ marginRight: '8px' }} /> Reject
                          </DropdownMenuItem>
                        )}
                        {member.status === 'Rejected' && showApplicationActions && (
                          <DropdownMenuItem onClick={() => handleRevoke(member)} style={{ color: 'var(--warning)', cursor: 'pointer' }}>
                            <RefreshCw size={14} style={{ marginRight: '8px' }} /> Revoke
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setSelectedMember(member)} style={{ cursor: 'pointer' }}>
                          <Eye size={14} style={{ marginRight: '8px' }} /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingMember({ ...member })} style={{ cursor: 'pointer' }}>
                          <Edit3 size={14} style={{ marginRight: '8px' }} /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(member)} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                          <XCircle size={14} style={{ marginRight: '8px' }} /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>`;

// fallback using robust replacement
const actionIndex = code.indexOf(`<div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>`);
if (actionIndex !== -1) {
  const endIndex = code.indexOf(`</div>`, code.indexOf(`<XCircle size={14} /> Delete`, actionIndex));
  if (endIndex !== -1) {
    const chunkToReplace = code.substring(actionIndex, endIndex + 6);
    code = code.replace(chunkToReplace, newActions);
  }
}

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('MemberTable actions replaced with DropdownMenu.');
