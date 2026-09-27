import {
  getAllOrganizationHierarchy,
  getOrganizationById,
  createOrganizationUnit,
  updateOrganizationUnit,
  getHierarchyPath,
} from '@/lib/organizations';
import { getDatabase } from '@/lib/database';

/**
 * Organization Service (`services/organizationService.js`)
 * --------------------------------------------------------
 * Manages the dynamic organizational structure.
 */

export const organizationService = {
  getHierarchy({ includeInactive = true } = {}) {
    const raw = getAllOrganizationHierarchy({ includeInactive });
    const db = getDatabase();

    // Attach counts and hierarchy path to each org unit
    const enrichedUnits = raw.orgUnits.map((u) => {
      const childrenCount = db.orgUnits.filter((child) => child.parentId === u.id).length;
      const membersCount = db.members.filter(
        (m) => m.orgUnitId === u.id && ['Active', 'Approved'].includes(m.status)
      ).length;
      
      const path = getHierarchyPath(u.id);
      const parentName = u.parentId ? db.orgUnits.find(p => p.id === u.parentId)?.name : null;

      return {
        ...u,
        parentName,
        childrenCount,
        membersCount,
        hierarchyPath: path,
        locationLabel: path.map(p => p.name).join(' › '),
      };
    });

    return {
      orgLevels: raw.orgLevels,
      orgUnits: enrichedUnits,
    };
  },

  getUnitById(id) {
    return getOrganizationById(id);
  },

  createUnit(payload) {
    return createOrganizationUnit(payload);
  },

  updateUnit(payload) {
    return updateOrganizationUnit(payload);
  },
};
