const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');
const paginationCode = `
      {/* Server-side Pagination Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> • Total
          Records: <strong>{pagination.total}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type='button'
            className='btn btn-outline btn-sm'
            disabled={!pagination.hasPrevPage}
            onClick={() => fetchMembers(pagination.page - 1)}
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <button
            type='button'
            className='btn btn-outline btn-sm'
            disabled={!pagination.hasNextPage}
            onClick={() => fetchMembers(pagination.page + 1)}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
`;
code = code.replace('{/* VIEW MEMBER DETAILS MODAL */}', paginationCode + '\n      {/* VIEW MEMBER DETAILS MODAL */}');

// Also update default limit from 10 to 50 so DataTable has enough records to work nicely locally per page
code = code.replace('limit: 10,', 'limit: 50,');
code = code.replace(`limit: '10',`, `limit: '50',`);
code = code.replace(`limit: String(pagination.limit),`, `limit: "50",`);

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('Restored Server-side Pagination.');
