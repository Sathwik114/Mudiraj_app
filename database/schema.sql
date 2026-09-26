-- ============================================================================
-- MUDIRAJ COMMUNITY MEMBERSHIP MANAGEMENT SYSTEM
-- Production SQL Schema (Compatible with PostgreSQL / SQL Server / MySQL)
-- Designed for 2,000,000+ (20 Lakh+) Member Records with High-Speed Indexing
-- ============================================================================

-- 1. Persistent Sequence Counter for Membership IDs (MUD-00000001+)
CREATE TABLE membership_sequences (
    sequence_name VARCHAR(64) PRIMARY KEY,
    current_value BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO membership_sequences (sequence_name, current_value)
VALUES ('membershipId', 0);

-- 2. Administrators Table
CREATE TABLE admins (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(128) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMIN',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Organizational Hierarchy: State -> District -> Constitution -> Mandal -> Gramam
CREATE TABLE states (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(64) NOT NULL REFERENCES states(id),
    name VARCHAR(120) NOT NULL,
    code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_districts_state ON districts(state_id, status);

CREATE TABLE constitutions (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(64) NOT NULL REFERENCES states(id),
    district_id VARCHAR(64) NOT NULL REFERENCES districts(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_constitutions_district ON constitutions(district_id, status);

CREATE TABLE mandals (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(64) NOT NULL REFERENCES states(id),
    district_id VARCHAR(64) NOT NULL REFERENCES districts(id),
    constitution_id VARCHAR(64) NOT NULL REFERENCES constitutions(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mandals_constitution ON mandals(constitution_id, status);

-- Gramam Table (Pre-structured for Future Feature Activation without schema changes)
CREATE TABLE gramams (
    id VARCHAR(64) PRIMARY KEY,
    state_id VARCHAR(64) NOT NULL REFERENCES states(id),
    district_id VARCHAR(64) NOT NULL REFERENCES districts(id),
    constitution_id VARCHAR(64) NOT NULL REFERENCES constitutions(id),
    mandal_id VARCHAR(64) NOT NULL REFERENCES mandals(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    is_future_feature BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_gramams_mandal ON gramams(mandal_id, status);

-- 4. Members & Applications Table (Scalable to 2,000,000+ rows)
CREATE TABLE members (
    id VARCHAR(64) PRIMARY KEY,
    application_no VARCHAR(40) NOT NULL UNIQUE,
    membership_id VARCHAR(32) NULL UNIQUE, -- Generated ONLY upon approval (e.g. MUD-00000001)
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NOT NULL,
    mother_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    alternate_mobile VARCHAR(15) NULL,
    email VARCHAR(150) NULL,
    photo_url TEXT NULL,
    house_no VARCHAR(100) NOT NULL,
    street VARCHAR(200) NOT NULL,
    gramam_id VARCHAR(64) NULL,
    gramam_name VARCHAR(150) NOT NULL,
    mandal_id VARCHAR(64) NOT NULL REFERENCES mandals(id),
    constitution_id VARCHAR(64) NOT NULL REFERENCES constitutions(id),
    district_id VARCHAR(64) NOT NULL REFERENCES districts(id),
    state_id VARCHAR(64) NOT NULL REFERENCES states(id),
    pincode VARCHAR(10) NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Active, Inactive
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    approved_by VARCHAR(64) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Critical Indexes for 2,000,000+ Member Search, Filtering, and Pagination
CREATE UNIQUE INDEX idx_members_membership_id ON members(membership_id) WHERE membership_id IS NOT NULL;
CREATE INDEX idx_members_mobile ON members(mobile);
CREATE INDEX idx_members_status_created ON members(status, created_at DESC);
CREATE INDEX idx_members_location ON members(district_id, constitution_id, mandal_id, status);
CREATE INDEX idx_members_fullname ON members(full_name);

-- 5. Reusable Teams Table (Main Team, Youth Team, Mahila Team at every Org Level)
CREATE TABLE teams (
    id VARCHAR(64) PRIMARY KEY,
    team_type VARCHAR(40) NOT NULL, -- 'Main Team', 'Youth Team', 'Mahila Team'
    org_level VARCHAR(30) NOT NULL, -- 'State', 'District', 'Constitution', 'Mandal', 'Gramam'
    org_id VARCHAR(64) NOT NULL,
    org_name VARCHAR(150) NOT NULL,
    state_id VARCHAR(64) NOT NULL,
    district_id VARCHAR(64) NULL,
    constitution_id VARCHAR(64) NULL,
    mandal_id VARCHAR(64) NULL,
    gramam_id VARCHAR(64) NULL,
    executive_member_limit INT NOT NULL DEFAULT 14,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_type, org_level, org_id)
);
CREATE INDEX idx_teams_org ON teams(org_level, org_id, team_type);

-- 6. Team Leadership Assignments (Links Registered Members to Leadership Positions)
CREATE TABLE team_members (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    member_id VARCHAR(64) NOT NULL REFERENCES members(id),
    membership_id VARCHAR(32) NOT NULL,
    position_code VARCHAR(50) NOT NULL, -- PRESIDENT, VICE_PRESIDENT, GENERAL_SECRETARY, SECRETARY, TREASURER, EXECUTIVE_MEMBER
    position_title VARCHAR(100) NOT NULL,
    slot_number INT NOT NULL DEFAULT 1,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(64) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    UNIQUE(team_id, member_id) -- Prevents same member from holding conflicting duplicate positions in same team
);
CREATE INDEX idx_team_members_team ON team_members(team_id, status);
CREATE INDEX idx_team_members_member ON team_members(member_id, status);

-- 7. Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NULL,
    actor VARCHAR(100) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
