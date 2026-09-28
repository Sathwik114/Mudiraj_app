const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

// 1. Add showFilters state
code = code.replace(/const \[feedback, setFeedback\] = useState\(\{ type: '', text: '' \}\);/, 
`const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);`);

// 2. Add Filter Toggle button next to search
const searchGroupOld = `<div className="form-group">
            <label className="form-label">Search (Membership ID / Name / Mobile)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MUD-00000001, Name, or 9848..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} /> Search
              </button>
            </div>
          </div>`;

const searchGroupNew = `<div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Search (Membership ID / Name / Mobile)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MUD-00000001, Name, or 9848..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} /> <span className="hide-mobile">Search</span>
              </button>
              <button type="button" className="btn btn-outline btn-sm mobile-only-flex" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter size={15} /> Filters
              </button>
            </div>
          </div>`;
          
code = code.replace(searchGroupOld, searchGroupNew);

// 3. Wrap advanced filters in a div that handles display
code = code.replace(/<div className="form-group">\s*<label className="form-label">Membership Status<\/label>/, 
  `{/* Advanced Filters Wrapper */}\n          <div style={{ display: showAdvancedFilters ? 'contents' : '' }} className={showAdvancedFilters ? '' : 'hide-mobile-grid'}>\n            <div className="form-group">\n              <label className="form-label">Membership Status</label>`);

// close the wrapper after the Team & Leadership Filter
const teamFilterEnd = `</select>
            </div>
          </div>
        </div>`;

code = code.replace(teamFilterEnd, `</select>
            </div>
          </div>
          </div> {/* End Advanced Filters Wrapper */}
        </div>`);

// 4. Update table cells with data-label
code = code.replace(/<td>\s*\{member\.membershipId \?/g, `<td data-label="Membership ID / App No">\n                    {member.membershipId ?`);
code = code.replace(/<td>\s*<div style=\{\{ fontWeight: 700/g, `<td data-label="Member Name & Parentage">\n                    <div style={{ fontWeight: 700`);
code = code.replace(/<td>\s*<div style=\{\{ fontWeight: 600 \}\}>\{member\.mobile\}<\/div>/g, `<td data-label="Mobile & Gender">\n                    <div style={{ fontWeight: 600 }}>{member.mobile}</div>`);
code = code.replace(/<td>\s*<div style=\{\{ fontWeight: 600, fontSize: '13px' \}\}>\{member\.districtName\}<\/div>/g, `<td data-label="District / Constitution / Mandal">\n                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.districtName}</div>`);
code = code.replace(/<td>\s*\{member\.leadershipPositions && member\.leadershipPositions\.length > 0/g, `<td data-label="Leadership Role">\n                    {member.leadershipPositions && member.leadershipPositions.length > 0`);
code = code.replace(/<td>\{renderStatusBadge\(member\.status\)\}<\/td>/g, `<td data-label="Status">{renderStatusBadge(member.status)}</td>`);
code = code.replace(/<td style=\{\{ textAlign: 'right' \}\}>\s*<div style=\{\{ display: 'inline-flex'/g, `<td data-label="Actions" style={{ textAlign: 'right' }}>\n                    <div style={{ display: 'inline-flex'`);
code = code.replace(/<td style=\{\{ textAlign: 'right' \}\}>\s*<DropdownMenu>/g, `<td data-label="Actions" style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>\n                    <DropdownMenu>`);

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('MemberTable.jsx updated with filters and data-labels.');
