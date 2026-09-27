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

-- 3. Dynamic Organizational Hierarchy (Team Type Master & Team Master)
-- Team Type Master (e.g. State, District, Constituency, Mandal)
CREATE TABLE org_levels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    level_rank INT NOT NULL UNIQUE, -- 1=State, 2=District, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Team Master (e.g. Andhra Pradesh, Nellore, Gudur, Naidupeta)
CREATE TABLE org_units (
    id VARCHAR(64) PRIMARY KEY,
    org_level_id VARCHAR(64) NOT NULL REFERENCES org_levels(id),
    parent_id VARCHAR(64) NULL REFERENCES org_units(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id, name)
);
CREATE INDEX idx_org_units_level ON org_units(org_level_id, status);
CREATE INDEX idx_org_units_parent ON org_units(parent_id, status);

-- 4. Members & Applications Table
CREATE TABLE members (
    id VARCHAR(64) PRIMARY KEY,
    application_no VARCHAR(40) NOT NULL UNIQUE,
    membership_id VARCHAR(32) NULL UNIQUE,
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
    
    -- Dynamic Location Binding
    org_unit_id VARCHAR(64) NOT NULL REFERENCES org_units(id),
    location_path VARCHAR(255) NOT NULL, -- Materialized path like "/state_id/district_id/mandal_id/" for fast indexing
    pincode VARCHAR(10) NOT NULL,
    
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    approved_by VARCHAR(64) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_members_membership_id ON members(membership_id) WHERE membership_id IS NOT NULL;
CREATE INDEX idx_members_mobile ON members(mobile);
CREATE INDEX idx_members_status_created ON members(status, created_at DESC);
CREATE INDEX idx_members_org_unit ON members(org_unit_id, status);
CREATE INDEX idx_members_location_path ON members(location_path);

-- 5. Reusable Teams Table (Main, Youth, Ladies at every Org Level)
CREATE TABLE teams (
    id VARCHAR(64) PRIMARY KEY,
    team_type VARCHAR(40) NOT NULL, -- 'Main Team', 'Youth Team', 'Ladies Team'
    org_unit_id VARCHAR(64) NOT NULL REFERENCES org_units(id),
    executive_member_limit INT NOT NULL DEFAULT 14,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_unit_id, team_type)
);
CREATE INDEX idx_teams_org ON teams(org_unit_id, team_type, status);

-- 6. Team Leadership Assignments
CREATE TABLE team_members (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    member_id VARCHAR(64) NOT NULL REFERENCES members(id),
    membership_id VARCHAR(32) NOT NULL,
    position_code VARCHAR(50) NOT NULL,
    position_title VARCHAR(100) NOT NULL,
    slot_number INT NOT NULL DEFAULT 1,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(64) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    UNIQUE(team_id, member_id)
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
