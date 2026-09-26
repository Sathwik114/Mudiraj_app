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
 * Manages State -> District -> Constitution -> Mandal -> Gramam hierarchy.
 * Uses soft activation/deactivation (`Active` / `Inactive`) rather than permanent deletion.
 * Automatically initializes the 3 reusable teams (Main, Youth, Mahila) when a new unit is created.
 */

export function getAllOrganizationHierarchy({ includeInactive = true } = {}) {
  const db = getDatabase();
  const filterStatus = (items) =>
    includeInactive ? items : items.filter((item) => item.status === 'Active');

  return {
    states: filterStatus(db.states),
    districts: filterStatus(db.districts),
    constitutions: filterStatus(db.constitutions),
    mandals: filterStatus(db.mandals),
    gramams: filterStatus(db.gramams),
  };
}

export function getOrganizationById(level, id) {
  const db = getDatabase();
  const collectionMap = {
    State: db.states,
    District: db.districts,
    Constitution: db.constitutions,
    Mandal: db.mandals,
    Gramam: db.gramams,
  };
  const list = collectionMap[level] || [];
  return list.find((item) => item.id === id) || null;
}

export function createOrganizationUnit({
  level,
  name,
  code,
  stateId = 'state-ap',
  districtId = null,
  constitutionId = null,
  mandalId = null,
  actor = 'admin',
}) {
  const db = getDatabase();
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new Error(`${level} Name is required.`);
  }

  const now = new Date().toISOString();
  let newUnit = null;

  if (level === 'District') {
    const exists = db.districts.some(
      (d) => d.stateId === stateId && d.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) throw new Error(`District "${trimmedName}" already exists under Andhra Pradesh.`);

    newUnit = {
      id: generateUuid('dist'),
      stateId,
      name: trimmedName,
      code: (code || `AP-${trimmedName.slice(0, 3).toUpperCase()}`).trim(),
      status: 'Active',
      createdAt: now,
    };
    db.districts.push(newUnit);

    const newTeams = buildDefaultTeamsForOrg({
      orgLevel: 'District',
      orgId: newUnit.id,
      orgName: `${newUnit.name} District`,
      stateId,
      districtId: newUnit.id,
    });
    db.teams.push(...newTeams);
  } else if (level === 'Constitution') {
    if (!districtId) throw new Error('District is required to create a Constitution.');
    const district = db.districts.find((d) => d.id === districtId);
    if (!district) throw new Error('Selected District does not exist.');

    const exists = db.constitutions.some(
      (c) => c.districtId === districtId && c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) throw new Error(`Constitution "${trimmedName}" already exists in ${district.name}.`);

    newUnit = {
      id: generateUuid('const'),
      stateId: district.stateId,
      districtId,
      name: trimmedName,
      code: (code || `AC-${db.constitutions.length + 101}`).trim(),
      status: 'Active',
      createdAt: now,
    };
    db.constitutions.push(newUnit);

    const newTeams = buildDefaultTeamsForOrg({
      orgLevel: 'Constitution',
      orgId: newUnit.id,
      orgName: `${newUnit.name} Constitution`,
      stateId: district.stateId,
      districtId,
      constitutionId: newUnit.id,
    });
    db.teams.push(...newTeams);
  } else if (level === 'Mandal') {
    if (!districtId || !constitutionId) {
      throw new Error('District and Constitution are required to create a Mandal.');
    }
    const constitution = db.constitutions.find((c) => c.id === constitutionId);
    if (!constitution) throw new Error('Selected Constitution does not exist.');

    const exists = db.mandals.some(
      (m) => m.constitutionId === constitutionId && m.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) throw new Error(`Mandal "${trimmedName}" already exists in ${constitution.name}.`);

    newUnit = {
      id: generateUuid('mandal'),
      stateId: constitution.stateId,
      districtId: constitution.districtId,
      constitutionId,
      name: trimmedName,
      code: (code || `MND-${String(db.mandals.length + 1).padStart(3, '0')}`).trim(),
      status: 'Active',
      createdAt: now,
    };
    db.mandals.push(newUnit);

    const newTeams = buildDefaultTeamsForOrg({
      orgLevel: 'Mandal',
      orgId: newUnit.id,
      orgName: newUnit.name,
      stateId: constitution.stateId,
      districtId: constitution.districtId,
      constitutionId,
      mandalId: newUnit.id,
    });
    db.teams.push(...newTeams);
  } else if (level === 'Gramam') {
    if (!mandalId) {
      throw new Error('Mandal is required to register a Gramam.');
    }
    const mandal = db.mandals.find((m) => m.id === mandalId);
    if (!mandal) throw new Error('Selected Mandal does not exist.');

    const exists = db.gramams.some(
      (g) => g.mandalId === mandalId && g.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) throw new Error(`Gramam "${trimmedName}" already exists in ${mandal.name}.`);

    newUnit = {
      id: generateUuid('gramam'),
      stateId: mandal.stateId,
      districtId: mandal.districtId,
      constitutionId: mandal.constitutionId,
      mandalId,
      name: trimmedName,
      code: (code || `GRM-${String(db.gramams.length + 1).padStart(3, '0')}`).trim(),
      status: 'Active',
      isFutureFeature: true,
      createdAt: now,
    };
    db.gramams.push(newUnit);

    const newTeams = buildDefaultTeamsForOrg({
      orgLevel: 'Gramam',
      orgId: newUnit.id,
      orgName: newUnit.name,
      stateId: mandal.stateId,
      districtId: mandal.districtId,
      constitutionId: mandal.constitutionId,
      mandalId,
      gramamId: newUnit.id,
    });
    db.teams.push(...newTeams);
  } else {
    throw new Error('Only District, Constitution, Mandal, or Gramam units can be added under Andhra Pradesh.');
  }

  saveDatabase(db);
  recordAuditLog({
    action: 'ORG_CREATED',
    entityType: level,
    entityId: newUnit.id,
    actor,
    details: `Created ${level} "${newUnit.name}" (${newUnit.code}) and auto-initialized Main, Youth, and Mahila teams.`,
  });

  return newUnit;
}

export function updateOrganizationUnit({ level, id, name, code, status, actor = 'admin' }) {
  const db = getDatabase();
  const collectionMap = {
    State: db.states,
    District: db.districts,
    Constitution: db.constitutions,
    Mandal: db.mandals,
    Gramam: db.gramams,
  };
  const collection = collectionMap[level];
  if (!collection) throw new Error(`Invalid organization level: ${level}`);

  const unit = collection.find((u) => u.id === id);
  if (!unit) throw new Error(`${level} unit not found.`);

  if (name && String(name).trim()) {
    unit.name = String(name).trim();
    // Also sync team names for this org
    db.teams.forEach((t) => {
      if (t.orgLevel === level && t.orgId === id) {
        t.orgName =
          level === 'District'
            ? `${unit.name} District`
            : level === 'Constitution'
            ? `${unit.name} Constitution`
            : unit.name;
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
    action: 'ORG_UPDATED',
    entityType: level,
    entityId: unit.id,
    actor,
    details: `Updated ${level} "${unit.name}" (Status: ${unit.status}).`,
  });

  return unit;
}
