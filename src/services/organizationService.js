import {
  getAllOrganizationHierarchy,
  getOrganizationById,
  createOrganizationUnit,
  updateOrganizationUnit,
} from '@/lib/organizations';
import { getDatabase } from '@/lib/database';

/**
 * Organization Service (`services/organizationService.js`)
 * --------------------------------------------------------
 * Manages State -> District -> Constitution -> Mandal -> Gramam structure.
 */

export const organizationService = {
  getHierarchy({ includeInactive = true } = {}) {
    const raw = getAllOrganizationHierarchy({ includeInactive });
    const db = getDatabase();

    // Attach counts to each organizational entity for rich UI display
    const districts = raw.districts.map((d) => ({
      ...d,
      constitutionsCount: db.constitutions.filter((c) => c.districtId === d.id).length,
      mandalsCount: db.mandals.filter((m) => m.districtId === d.id).length,
      membersCount: db.members.filter(
        (m) => m.districtId === d.id && ['Active', 'Approved'].includes(m.status)
      ).length,
    }));

    const constitutions = raw.constitutions.map((c) => {
      const dist = db.districts.find((d) => d.id === c.districtId);
      return {
        ...c,
        districtName: dist?.name || '',
        mandalsCount: db.mandals.filter((m) => m.constitutionId === c.id).length,
        membersCount: db.members.filter(
          (m) => m.constitutionId === c.id && ['Active', 'Approved'].includes(m.status)
        ).length,
      };
    });

    const mandals = raw.mandals.map((m) => {
      const dist = db.districts.find((d) => d.id === m.districtId);
      const cons = db.constitutions.find((c) => c.id === m.constitutionId);
      return {
        ...m,
        districtName: dist?.name || '',
        constitutionName: cons?.name || '',
        gramamsCount: db.gramams.filter((g) => g.mandalId === m.id).length,
        membersCount: db.members.filter(
          (mem) => mem.mandalId === m.id && ['Active', 'Approved'].includes(mem.status)
        ).length,
      };
    });

    const gramams = raw.gramams.map((g) => {
      const dist = db.districts.find((d) => d.id === g.districtId);
      const cons = db.constitutions.find((c) => c.id === g.constitutionId);
      const mnd = db.mandals.find((m) => m.id === g.mandalId);
      return {
        ...g,
        districtName: dist?.name || '',
        constitutionName: cons?.name || '',
        mandalName: mnd?.name || '',
      };
    });

    return {
      states: raw.states,
      districts,
      constitutions,
      mandals,
      gramams,
    };
  },

  getUnitById(level, id) {
    return getOrganizationById(level, id);
  },

  createUnit(payload) {
    return createOrganizationUnit(payload);
  },

  updateUnit(payload) {
    return updateOrganizationUnit(payload);
  },
};
