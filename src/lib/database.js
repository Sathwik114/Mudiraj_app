import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword } from './auth.js';
import { VALID_TEAM_TYPES } from './validation.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'mudiraj_db.json');

let memoryCache = null;

export function generateUuid(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

/**
 * Builds default 3 teams (Main Team, Youth Team, Mahila/Ladies Team) for any organizational unit.
 */
export function buildDefaultTeamsForOrg({ orgUnitId, orgName }) {
  const now = new Date().toISOString();
  return VALID_TEAM_TYPES.map((teamType) => {
    const slug = teamType.toLowerCase().replace(/\s+/g, '-');
    return {
      id: `team-${orgUnitId}-${slug}`,
      teamType,
      orgUnitId,
      orgName,
      executiveMemberLimit: 14,
      status: 'Active',
      createdAt: now,
    };
  });
}

/**
 * Generates initial seed data matching the dynamic hierarchy schema.
 */
function createInitialSeedDatabase() {
  const now = new Date().toISOString();
  const { salt, hash } = hashPassword('Admin@123');

  const admins = [
    {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@mudiraj.org',
      fullName: 'State Chief Administrator',
      passwordHash: hash,
      passwordSalt: salt,
      role: 'SUPER_ADMIN',
      status: 'Active',
      lastLoginAt: null,
      createdAt: now,
    }
  ];

  // 1. Team Type Master (org_levels)
  const orgLevels = [
    { id: 'level-1', name: 'State', levelRank: 1, status: 'Active', createdAt: now },
    { id: 'level-2', name: 'District', levelRank: 2, status: 'Active', createdAt: now },
    { id: 'level-3', name: 'Constituency', levelRank: 3, status: 'Active', createdAt: now },
    { id: 'level-4', name: 'Mandal', levelRank: 4, status: 'Active', createdAt: now },
    { id: 'level-5', name: 'Gramam', levelRank: 5, status: 'Active', createdAt: now },
  ];

  // 2. Team Master (org_units)
  const orgUnits = [
    // State
    { id: 'unit-ap', orgLevelId: 'level-1', parentId: null, name: 'Andhra Pradesh', code: 'AP', status: 'Active', createdAt: now },
    
    // Districts
    { id: 'unit-ntr', orgLevelId: 'level-2', parentId: 'unit-ap', name: 'NTR', code: 'NTR', status: 'Active', createdAt: now },
    { id: 'unit-knl', orgLevelId: 'level-2', parentId: 'unit-ap', name: 'Kurnool', code: 'KNL', status: 'Active', createdAt: now },
    { id: 'unit-nlr', orgLevelId: 'level-2', parentId: 'unit-ap', name: 'Nellore', code: 'NLR', status: 'Active', createdAt: now },
    
    // Constituencies
    { id: 'unit-vjacen', orgLevelId: 'level-3', parentId: 'unit-ntr', name: 'Vijayawada Central', code: 'AC-080', status: 'Active', createdAt: now },
    { id: 'unit-gudur', orgLevelId: 'level-3', parentId: 'unit-nlr', name: 'Gudur', code: 'AC-119', status: 'Active', createdAt: now },
    
    // Mandals
    { id: 'unit-vjaurban', orgLevelId: 'level-4', parentId: 'unit-vjacen', name: 'Vijayawada Urban Mandal', code: 'MND-004', status: 'Active', createdAt: now },
    { id: 'unit-naidupeta', orgLevelId: 'level-4', parentId: 'unit-gudur', name: 'Naidupeta Mandal', code: 'MND-120', status: 'Active', createdAt: now },
  ];

  // 3. Teams
  const teams = [];
  orgUnits.forEach((unit) => {
    teams.push(...buildDefaultTeamsForOrg({
      orgUnitId: unit.id,
      orgName: unit.name
    }));
  });

  // 4. Members
  const members = [
    {
      id: 'mem-101',
      applicationNo: 'APP-2026-0001',
      membershipId: 'MUD-00000001',
      memberPassword: 'MUD984',
      password: 'MUD984',
      fullName: 'Chandu Anna Mudiraj',
      fatherName: 'Venkataiah Mudiraj',
      motherName: 'Lakshmi Devi',
      dob: '1982-05-14',
      gender: 'Male',
      bloodGroup: 'O+',
      occupation: 'Social Service & Agriculture',
      mobile: '9848011223',
      alternateMobile: '9440112233',
      email: 'chandu.mudiraj@example.org',
      photoUrl: '',
      houseNo: '12-4-88/A',
      street: 'Gandhi Nagar Main Road',
      
      orgUnitId: 'unit-vjaurban',
      locationPath: '/unit-ap/unit-ntr/unit-vjacen/unit-vjaurban/',
      pincode: '520010',
      
      idType: 'Aadhaar Card',
      idNumber: '482910394812',
      status: 'Active',
      applicationDate: now,
      approvalDate: now,
      approvedBy: 'admin',
      remarks: 'Founding State President - Verified & Approved',
      createdAt: now,
      updatedAt: now,
    },
    // Add one pending member
    {
      id: 'mem-102',
      applicationNo: 'APP-2026-0002',
      membershipId: null,
      fullName: 'Srinivasulu Mudiraj',
      fatherName: 'Ramaiah Mudiraj',
      motherName: 'Saraswathi',
      dob: '1979-08-22',
      gender: 'Male',
      bloodGroup: 'B+',
      occupation: 'Business',
      mobile: '9849123450',
      alternateMobile: '',
      email: 'srinivas.mudiraj@example.org',
      photoUrl: '',
      houseNo: '45/210',
      street: 'Narasimha Rao Peta',
      
      orgUnitId: 'unit-naidupeta',
      locationPath: '/unit-ap/unit-nlr/unit-gudur/unit-naidupeta/',
      pincode: '524126',
      
      idType: 'Voter ID (EPIC)',
      idNumber: 'AP18293041',
      status: 'Pending',
      applicationDate: now,
      approvalDate: null,
      approvedBy: null,
      remarks: 'Applied online',
      createdAt: now,
      updatedAt: now,
    }
  ];

  // 5. Team Members (Leaders)
  const teamMembers = [
    {
      id: 'tm-1',
      teamId: `team-unit-ap-main-team`,
      memberId: 'mem-101',
      membershipId: 'MUD-00000001',
      positionCode: 'PRESIDENT',
      positionTitle: 'President / Chairman',
      slotNumber: 1,
      assignedAt: now,
      assignedBy: 'admin',
      status: 'Active',
    }
  ];

  // 6. Audit Logs
  const auditLogs = [
    {
      id: 'log-1',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: 'unit-ap',
      actor: 'system',
      details: 'Initialized Database with dynamic organization hierarchy.',
      createdAt: now,
    }
  ];

  return {
    meta: {
      version: '2.0.0',
      databaseEngine: 'Dynamic Hierarchy JSON Adapter',
      createdAt: now,
      updatedAt: now,
    },
    sequences: {
      membershipId: 2, 
      applicationNo: 3, 
    },
    admins,
    orgLevels,
    orgUnits,
    teams,
    members,
    teamMembers,
    auditLogs,
  };
}

export function getDatabase() {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      memoryCache = JSON.parse(raw);
      // Auto-migrate: If the old schema is detected, recreate the seed data
      if (!memoryCache.orgLevels) {
        memoryCache = createInitialSeedDatabase();
        saveDatabase(memoryCache);
      }
    } else {
      memoryCache = createInitialSeedDatabase();
      saveDatabase(memoryCache);
    }
  } catch (error) {
    console.error('Error loading local database JSON:', error);
    memoryCache = createInitialSeedDatabase();
  }

  return memoryCache;
}

export function saveDatabase(db) {
  memoryCache = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving local database JSON:', error);
  }
}

export function generateMembershipId(currentSequence) {
  const pad = String(currentSequence).padStart(8, '0');
  return `MUD-${pad}`;
}

export function generateApplicationNumber(currentSequence) {
  const year = new Date().getFullYear();
  const pad = String(currentSequence).padStart(4, '0');
  return `APP-${year}-${pad}`;
}

export function getNextSequence(sequenceName) {
  const db = getDatabase();
  if (db.sequences[sequenceName] === undefined) {
    db.sequences[sequenceName] = 1;
  } else {
    db.sequences[sequenceName] += 1;
  }
  saveDatabase(db);
  return db.sequences[sequenceName];
}

export function recordAuditLog({ action, entityType, entityId, actor, details }) {
  const db = getDatabase();
  db.auditLogs.unshift({
    id: generateUuid('log'),
    action,
    entityType,
    entityId,
    actor,
    details,
    createdAt: new Date().toISOString(),
  });
  // Keep last 1000 logs in JSON store to prevent bloat
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
  saveDatabase(db);
}
