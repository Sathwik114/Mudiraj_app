const fs = require('fs');
let code = fs.readFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', 'utf8');

// 1. Add the missing closing div for Advanced Filters Wrapper
code = code.replace(/<\/select>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div/g, 
  '</select>\n            </div>\n          </div>\n          </div> {/* End Advanced Filters Wrapper */}\n        </div>\n\n        <div');

// 2. Add the Filter toggle button to the search group
code = code.replace(/<button type="submit" className="btn btn-primary btn-sm">\s*<Search size=\{15\} \/> Search\s*<\/button>/, 
  `<button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} /> <span className="hide-mobile">Search</span>
              </button>
              <button type="button" className="btn btn-outline btn-sm mobile-only-flex" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter size={15} /> Filters
              </button>`);

// 3. Make search input stretch
code = code.replace(/placeholder="e\.g\. MUD-00000001, Name, or 9848\.\.\."\s*value=\{search\}\s*onChange=\{\(e\) => setSearch\(e\.target\.value\)\}\s*\/>/g,
  `placeholder="e.g. MUD-00000001, Name, or 9848..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1 }}
              />`);

fs.writeFileSync('D:/Mudiraj_app/src/components/MemberTable.jsx', code);
console.log('Fixed syntax error and search form');
