const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

const importStatement = `import DataTable from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';\n`;

code = code.replace(`import { useState, useEffect, useCallback } from 'react';`, `import { useState, useEffect, useCallback } from 'react';\n` + importStatement);

const columnsAndRenders = `
  const columns = [
    { key: 'memberInfo', label: 'Membership ID / App No' },
    { key: 'name', label: 'Member Name & Parentage' },
    { key: 'contact', label: 'Mobile & Gender' },
    { key: 'location', label: 'District / Constitution / Mandal' },
    { key: 'role', label: 'Leadership Role' },
    { key: 'status', label: 'Status' }
  ];

  const renderCell = (row, col) => {
    switch (col.key) {
      case 'memberInfo':
        return (
          <>
            {row.membershipId ? (
              <>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '14px' }}>
                  {row.membershipId}
                </div>
                {(row.memberPassword || row.password) && (
                  <div style={{ fontSize: '11px', color: 'var(--accent-hover)', fontWeight: 700 }}>
                    Pass: <code>{row.memberPassword || row.password}</code>
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700 }}>
                ID Pending Approval
              </div>
            )}
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              App: {row.applicationNo}
            </div>
          </>
        );
      case 'name':
        return (
          <>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {row.fullName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              S/D/o: {row.fatherName}
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <div style={{ fontWeight: 600 }}>{row.mobile}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {row.gender} • DOB: {row.dob}
            </div>
          </>
        );
      case 'location':
        return (
          <>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>{row.districtName}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {row.constitutionName} › {row.mandalName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Gramam: {row.gramamName} ({row.pincode})
            </div>
          </>
        );
      case 'role':
        return row.leadershipPositions && row.leadershipPositions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {row.leadershipPositions.map((lp) => (
              <span
                key={lp.teamMemberId}
                className='badge badge-info'
                style={{ fontSize: '11px' }}
              >
                <Award size={11} /> {lp.positionTitle} ({lp.orgLevel} - {lp.teamType})
              </span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            General Member
          </span>
        );
      case 'status':
        return renderStatusBadge(row.status);
      default:
        return row[col.key];
    }
  };

  const renderActions = (member) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='btn btn-outline btn-sm h-8 w-8 p-0 flex items-center justify-center rounded-md'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='bg-white'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {(member.status === 'Pending' || showApplicationActions) && member.status !== 'Active' && (
            <DropdownMenuItem onClick={() => handleApprove(member)} className='text-green-600 cursor-pointer'>
              <CheckCircle className='mr-2 h-4 w-4' /> Approve
            </DropdownMenuItem>
          )}

          {member.status === 'Pending' && (
            <DropdownMenuItem onClick={() => { setRejectModalMember(member); setRejectRemarks(''); }} className='text-red-600 cursor-pointer'>
              <XCircle className='mr-2 h-4 w-4' /> Reject
            </DropdownMenuItem>
          )}

          {member.status === 'Rejected' && showApplicationActions && (
            <DropdownMenuItem onClick={() => handleRevoke(member)} className='text-yellow-600 cursor-pointer'>
              <RefreshCw className='mr-2 h-4 w-4' /> Revoke
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setSelectedMember(member)} className='cursor-pointer'>
            <Eye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setEditingMember({ ...member })} className='cursor-pointer'>
            <Edit3 className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleDelete(member)} className='text-red-600 cursor-pointer'>
            <XCircle className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
`;

code = code.replace(`  function renderStatusBadge(st) {`, columnsAndRenders + '\n  function renderStatusBadge(st) {');

const tableStart = code.indexOf('{/* Data Table */}');
const paginationEnd = code.indexOf('{/* VIEW MEMBER DETAILS MODAL */}');

if (tableStart !== -1 && paginationEnd !== -1) {
  const dataTableUsage = `
      {/* Data Table Component */}
      <div style={{ flex: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        <DataTable 
          columns={columns}
          data={items}
          renderCell={renderCell}
          actionColumn={renderActions}
          isLoading={loading}
        />
      </div>

      `;
  code = code.substring(0, tableStart) + dataTableUsage + code.substring(paginationEnd);
} else {
  console.log('Could not find boundaries for table replacement.');
}

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('MemberTable.jsx successfully updated.');
