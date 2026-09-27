import {
  getDatabase,
  saveDatabase,
  generateUuid,
  buildDefaultTeamsForOrg,
  recordAuditLog,
} from './database.js';

/**
 * Organization Repository Layer (`lib/organizations.js`)
 * -----------------------------------------------------
 * Manages dynamic organizational hierarchy via org_levels and org_units.
 * Uses soft activation/deactivation (`Active` / `Inactive`).
 * Automatically initializes teams when a new unit is created.
 */

export function getAllOrganizationHierarchy({ includeInactive = true } = {}) {
  const db = getDatabase();
  const filterStatus = (items) =>
    includeInactive ? items : items.filter((item) => item.status === 'Active');

  return {
    orgLevels: filterStatus(db.orgLevels).sort((a, b) => a.levelRank - b.levelRank),
    orgUnits: filterStatus(db.orgUnits),
  };
}

export function getOrganizationById(id) {
  const db = getDatabase();
  return db.orgUnits.find((item) => item.id === id) || null;
}

export function getHierarchyPath(orgUnitId) {
  const db = getDatabase();
  const path = [];
  let currentId = orgUnitId;
  
  while (currentId) {
    const unit = db.orgUnits.find(u => u.id === currentId);
    if (unit) {
      path.unshift(unit); // Insert at beginning to maintain State -> District -> etc order
      currentId = unit.parentId;
    } else {
      break;
    }
  }
  return path;
}

export function createOrganizationUnit({
  orgLevelId,
  parentId,
  name,
  code,
  actor = 'admin',
}) {
  const db = getDatabase();
  const trimmedName = String(name || '').trim();
  
  if (!trimmedName) {
    throw new Error(`Name is required.`);
  }

  const level = db.orgLevels.find(l => l.id === orgLevelId);
  if (!level) throw new Error('Invalid Organizational Level selected.');

  // Validate parent dependency (higher hierarchy first)
  if (level.levelRank > 1) {
    if (!parentId) {
      throw new Error(`A Parent organization is required to create a ${level.name}.`);
    }
    const parentUnit = db.orgUnits.find(u => u.id === parentId);
    if (!parentUnit) {
      throw new Error('Selected Parent organization does not exist.');
    }
    const parentLevel = db.orgLevels.find(l => l.id === parentUnit.orgLevelId);
    if (parentLevel.levelRank >= level.levelRank) {
      throw new Error(`Parent organization must be of a higher hierarchy rank.`);
    }
  }

  const exists = db.orgUnits.some(
    (u) => u.parentId === parentId && u.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (exists) {
    throw new Error(`An organization named "${trimmedName}" already exists under the selected parent.`);
  }

  const now = new Date().toISOString();
  const newUnit = {
    id: generateUuid('unit'),
    orgLevelId,
    parentId: parentId || null,
    name: trimmedName,
    code: (code || `${level.name.slice(0, 3).toUpperCase()}-${trimmedName.slice(0, 3).toUpperCase()}`).trim(),
    status: 'Active',
    createdAt: now,
  };
  
  db.orgUnits.push(newUnit);

  // Auto-initialize teams for the new unit
  const newTeams = buildDefaultTeamsForOrg({
    orgUnitId: newUnit.id,
    orgName: newUnit.name,
  });
  db.teams.push(...newTeams);

  saveDatabase(db);
  
  recordAuditLog({
    action: 'ORG_UNIT_CREATED',
    entityType: 'OrgUnit',
    entityId: newUnit.id,
    actor,
    details: `Created ${level.name} "${newUnit.name}" and auto-initialized teams.`,
  });

  return newUnit;
}

export function updateOrganizationUnit({ id, name, code, status, actor = 'admin' }) {
  const db = getDatabase();
  const unit = db.orgUnits.find((u) => u.id === id);
  if (!unit) throw new Error(`Organization unit not found.`);

  if (name && String(name).trim()) {
    unit.name = String(name).trim();
    // Sync team names
    db.teams.forEach((t) => {
      if (t.orgUnitId === id) {
        t.orgName = unit.name;
      }
    });
  }
  if (code && String(code).trim()) {
    unit.code = String(code).trim();
  }
  if (status && ['Active', 'Inactive'].includes(status)) {
    unit.status = status;
  }

  saveDatabase(db);
  recordAuditLog({
    action: 'ORG_UNIT_UPDATED',
    entityType: 'OrgUnit',
    entityId: unit.id,
    actor,
    details: `Updated "${unit.name}" (Status: ${unit.status}).`,
  });

  return unit;
}

// Team Type Master (Org Levels)
export function createTeamType({ name, levelRank, actor = 'admin' }) {
  const db = getDatabase();
  const trimmedName = String(name || '').trim();
  if (!trimmedName) throw new Error('Team Type Name is required.');

  const rank = parseInt(levelRank, 10);
  if (isNaN(rank) || rank < 1) throw new Error('Level Rank must be a positive integer.');

  if (db.orgLevels.some(l => l.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('A Team Type with this name already exists.');
  }
  if (db.orgLevels.some(l => l.levelRank === rank)) {
    throw new Error(`A Team Type with Rank ${rank} already exists. Please choose a different rank.`);
  }

  const newLevel = {
    id: generateUuid('level'),
    name: trimmedName,
    levelRank: rank,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.orgLevels.push(newLevel);
  saveDatabase(db);
  
  recordAuditLog({
    action: 'TEAM_TYPE_CREATED',
    entityType: 'OrgLevel',
    entityId: newLevel.id,
    actor,
    details: `Created new Team Type "${newLevel.name}" with Rank ${newLevel.levelRank}.`,
  });

  return newLevel;
}
