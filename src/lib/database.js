import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword } from './auth.js';
import { VALID_TEAM_TYPES } from './validation.js';

/**
 * Isolated Database / Repository Adapter Layer
 * --------------------------------------------
 * For initial local development, uses an atomic file-backed JSON store (`data/mudiraj_db.json`)
 * with in-memory caching so zero external DB setup is required.
 *
 * When migrating to SQL Server, PostgreSQL, or MySQL in Phase 4, only this adapter layer
 * needs to be swapped to execute parameterized SQL queries against `database/schema.sql`.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE_PATH = path.join(DATA_DIR, 'mudiraj_db.json');

let memoryCache = null;

export function generateUuid(prefix = 'id') {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

/**
 * Builds default 3 teams (Main Team, Youth Team, Mahila Team) for any organizational entity.
 */
export function buildDefaultTeamsForOrg({
  orgLevel,
  orgId,
  orgName,
  stateId = 'state-ap',
  districtId = null,
  constitutionId = null,
  mandalId = null,
  gramamId = null,
}) {
  const now = new Date().toISOString();
  return VALID_TEAM_TYPES.map((teamType) => {
    const slug = teamType.toLowerCase().replace(/\s+/g, '-');
    return {
      id: `team-${orgId}-${slug}`,
      teamType,
      orgLevel,
      orgId,
      orgName,
      stateId,
      districtId,
      constitutionId,
      mandalId,
      gramamId,
      executiveMemberLimit: 14, // 1 Pres + 6 VP + 2 GenSec + 6 Sec + 1 Treas + 14 Exec = 30 default positions
      status: 'Active',
      createdAt: now,
    };
  });
}

/**
 * Generates initial seed data for Andhra Pradesh Mudiraj Community.
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
      createdAt: '2026-01-01T09:00:00.000Z',
    },
  ];

  // 1. State (Currently only Andhra Pradesh)
  const states = [
    {
      id: 'state-ap',
      name: 'Andhra Pradesh',
      code: 'AP',
      status: 'Active',
      createdAt: '2026-01-01T09:00:00.000Z',
    },
  ];

  // 2. Districts under Andhra Pradesh
  const districts = [
    { id: 'dist-vsp', stateId: 'state-ap', name: 'Visakhapatnam', code: 'AP-VSP', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-ntr', stateId: 'state-ap', name: 'NTR (Vijayawada)', code: 'AP-NTR', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-gnt', stateId: 'state-ap', name: 'Guntur', code: 'AP-GNT', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-knl', stateId: 'state-ap', name: 'Kurnool', code: 'AP-KNL', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-tpt', stateId: 'state-ap', name: 'Tirupati', code: 'AP-TPT', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-atp', stateId: 'state-ap', name: 'Anantapuramu', code: 'AP-ATP', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-kkd', stateId: 'state-ap', name: 'Kakinada', code: 'AP-KKD', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
    { id: 'dist-nlr', stateId: 'state-ap', name: 'SPSR Nellore', code: 'AP-NLR', status: 'Active', createdAt: '2026-01-02T10:00:00.000Z' },
  ];

  // 3. Constitutions (Assembly Constituencies) under Districts
  const constitutions = [
    { id: 'const-bheemili', stateId: 'state-ap', districtId: 'dist-vsp', name: 'Bheemunipatnam', code: 'AC-020', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-vspeast', stateId: 'state-ap', districtId: 'dist-vsp', name: 'Visakhapatnam East', code: 'AC-021', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-vjacen', stateId: 'state-ap', districtId: 'dist-ntr', name: 'Vijayawada Central', code: 'AC-080', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-mylavaram', stateId: 'state-ap', districtId: 'dist-ntr', name: 'Mylavaram', code: 'AC-082', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-mangalagiri', stateId: 'state-ap', districtId: 'dist-gnt', name: 'Mangalagiri', code: 'AC-087', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-gntwest', stateId: 'state-ap', districtId: 'dist-gnt', name: 'Guntur West', code: 'AC-094', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-kurnool', stateId: 'state-ap', districtId: 'dist-knl', name: 'Kurnool Urban', code: 'AC-137', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-kodumur', stateId: 'state-ap', districtId: 'dist-knl', name: 'Kodumur', code: 'AC-138', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-tirupati', stateId: 'state-ap', districtId: 'dist-tpt', name: 'Tirupati', code: 'AC-167', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-chandragiri', stateId: 'state-ap', districtId: 'dist-tpt', name: 'Chandragiri', code: 'AC-166', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-atpurban', stateId: 'state-ap', districtId: 'dist-atp', name: 'Anantapur Urban', code: 'AC-152', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-kkdcity', stateId: 'state-ap', districtId: 'dist-kkd', name: 'Kakinada City', code: 'AC-041', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
    { id: 'const-nlrcity', stateId: 'state-ap', districtId: 'dist-nlr', name: 'Nellore City', code: 'AC-117', status: 'Active', createdAt: '2026-01-03T10:00:00.000Z' },
  ];

  // 4. Mandals under Constitutions
  const mandals = [
    { id: 'mandal-bheemili', stateId: 'state-ap', districtId: 'dist-vsp', constitutionId: 'const-bheemili', name: 'Bheemunipatnam Mandal', code: 'MND-001', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-anandapuram', stateId: 'state-ap', districtId: 'dist-vsp', constitutionId: 'const-bheemili', name: 'Anandapuram Mandal', code: 'MND-002', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-vspurban', stateId: 'state-ap', districtId: 'dist-vsp', constitutionId: 'const-vspeast', name: 'Visakhapatnam Urban Mandal', code: 'MND-003', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-vjaurban', stateId: 'state-ap', districtId: 'dist-ntr', constitutionId: 'const-vjacen', name: 'Vijayawada Central Mandal', code: 'MND-004', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-ibrahimpatnam', stateId: 'state-ap', districtId: 'dist-ntr', constitutionId: 'const-mylavaram', name: 'Ibrahimpatnam Mandal', code: 'MND-005', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-mylavaram', stateId: 'state-ap', districtId: 'dist-ntr', constitutionId: 'const-mylavaram', name: 'Mylavaram Mandal', code: 'MND-006', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-mangalagiri', stateId: 'state-ap', districtId: 'dist-gnt', constitutionId: 'const-mangalagiri', name: 'Mangalagiri Mandal', code: 'MND-007', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-tadepalli', stateId: 'state-ap', districtId: 'dist-gnt', constitutionId: 'const-mangalagiri', name: 'Tadepalli Mandal', code: 'MND-008', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-gntwest', stateId: 'state-ap', districtId: 'dist-gnt', constitutionId: 'const-gntwest', name: 'Guntur West Mandal', code: 'MND-009', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-kurnool', stateId: 'state-ap', districtId: 'dist-knl', constitutionId: 'const-kurnool', name: 'Kurnool Urban Mandal', code: 'MND-010', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-kallur', stateId: 'state-ap', districtId: 'dist-knl', constitutionId: 'const-kurnool', name: 'Kallur Mandal', code: 'MND-011', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-kodumur', stateId: 'state-ap', districtId: 'dist-knl', constitutionId: 'const-kodumur', name: 'Kodumur Mandal', code: 'MND-012', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-tpturban', stateId: 'state-ap', districtId: 'dist-tpt', constitutionId: 'const-tirupati', name: 'Tirupati Urban Mandal', code: 'MND-013', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-chandragiri', stateId: 'state-ap', districtId: 'dist-tpt', constitutionId: 'const-chandragiri', name: 'Chandragiri Mandal', code: 'MND-014', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-atpurban', stateId: 'state-ap', districtId: 'dist-atp', constitutionId: 'const-atpurban', name: 'Anantapuramu Urban Mandal', code: 'MND-015', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-kkdurban', stateId: 'state-ap', districtId: 'dist-kkd', constitutionId: 'const-kkdcity', name: 'Kakinada Urban Mandal', code: 'MND-016', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
    { id: 'mandal-nlrurban', stateId: 'state-ap', districtId: 'dist-nlr', constitutionId: 'const-nlrcity', name: 'Nellore Urban Mandal', code: 'MND-017', status: 'Active', createdAt: '2026-01-04T10:00:00.000Z' },
  ];

  // 5. Gramams (Architecture built-in, marked as Future Feature)
  const gramams = [
    { id: 'gramam-1', stateId: 'state-ap', districtId: 'dist-knl', constitutionId: 'const-kurnool', mandalId: 'mandal-kurnool', name: 'Roza Gramam', code: 'GRM-001', status: 'Active', isFutureFeature: true, createdAt: '2026-01-05T10:00:00.000Z' },
    { id: 'gramam-2', stateId: 'state-ap', districtId: 'dist-ntr', constitutionId: 'const-mylavaram', mandalId: 'mandal-ibrahimpatnam', name: 'Kondapalli Gramam', code: 'GRM-002', status: 'Active', isFutureFeature: true, createdAt: '2026-01-05T10:00:00.000Z' },
    { id: 'gramam-3', stateId: 'state-ap', districtId: 'dist-gnt', constitutionId: 'const-mangalagiri', mandalId: 'mandal-mangalagiri', name: 'Atmakur Gramam', code: 'GRM-003', status: 'Active', isFutureFeature: true, createdAt: '2026-01-05T10:00:00.000Z' },
  ];

  // 6. Auto-create Main Team, Youth Team, and Mahila Team for State, Districts, Constitutions, and Mandals
  const teams = [];
  states.forEach((st) => {
    teams.push(
      ...buildDefaultTeamsForOrg({
        orgLevel: 'State',
        orgId: st.id,
        orgName: st.name,
        stateId: st.id,
      })
    );
  });

  districts.forEach((dist) => {
    teams.push(
      ...buildDefaultTeamsForOrg({
        orgLevel: 'District',
        orgId: dist.id,
        orgName: `${dist.name} District`,
        stateId: dist.stateId,
        districtId: dist.id,
      })
    );
  });

  constitutions.forEach((c) => {
    teams.push(
      ...buildDefaultTeamsForOrg({
        orgLevel: 'Constitution',
        orgId: c.id,
        orgName: `${c.name} Constitution`,
        stateId: c.stateId,
        districtId: c.districtId,
        constitutionId: c.id,
      })
    );
  });

  mandals.forEach((m) => {
    teams.push(
      ...buildDefaultTeamsForOrg({
        orgLevel: 'Mandal',
        orgId: m.id,
        orgName: m.name,
        stateId: m.stateId,
        districtId: m.districtId,
        constitutionId: m.constitutionId,
        mandalId: m.id,
      })
    );
  });

  gramams.forEach((g) => {
    teams.push(
      ...buildDefaultTeamsForOrg({
        orgLevel: 'Gramam',
        orgId: g.id,
        orgName: g.name,
        stateId: g.stateId,
        districtId: g.districtId,
        constitutionId: g.constitutionId,
        mandalId: g.mandalId,
        gramamId: g.id,
      })
    );
  });

  // 7. Sample Members & Applications
  const members = [
    {
      id: 'mem-101',
      applicationNo: 'APP-2026-0001',
      membershipId: 'MUD-00000001',
      fullName: 'Chandu Anna Mudiraj',
      fatherName: 'Venkataiah Mudiraj',
      motherName: 'Lakshmi Devi',
      dob: '1982-05-14',
      gender: 'Male',
      mobile: '9848011223',
      alternateMobile: '9440112233',
      email: 'chandu.mudiraj@example.org',
      photoUrl: '',
      houseNo: '12-4-88/A',
      street: 'Gandhi Nagar Main Road',
      gramamId: 'gramam-2',
      gramamName: 'Kondapalli',
      mandalId: 'mandal-ibrahimpatnam',
      mandalName: 'Ibrahimpatnam Mandal',
      constitutionId: 'const-mylavaram',
      constitutionName: 'Mylavaram',
      districtId: 'dist-ntr',
      districtName: 'NTR (Vijayawada)',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '521228',
      idType: 'Aadhaar Card',
      idNumber: '482910394812',
      status: 'Active',
      applicationDate: '2026-01-10T08:30:00.000Z',
      approvalDate: '2026-01-10T11:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'Founding State President - Verified & Approved',
      createdAt: '2026-01-10T08:30:00.000Z',
      updatedAt: '2026-01-10T11:00:00.000Z',
    },
    {
      id: 'mem-102',
      applicationNo: 'APP-2026-0002',
      membershipId: 'MUD-00000002',
      fullName: 'Srinivasulu Mudiraj',
      fatherName: 'Ramaiah Mudiraj',
      motherName: 'Saraswathi',
      dob: '1979-08-22',
      gender: 'Male',
      mobile: '9849123450',
      alternateMobile: '',
      email: 'srinivas.mudiraj@example.org',
      photoUrl: '',
      houseNo: '45/210',
      street: 'Narasimha Rao Peta',
      gramamId: 'gramam-1',
      gramamName: 'Roza Gramam',
      mandalId: 'mandal-kurnool',
      mandalName: 'Kurnool Urban Mandal',
      constitutionId: 'const-kurnool',
      constitutionName: 'Kurnool Urban',
      districtId: 'dist-knl',
      districtName: 'Kurnool',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '518001',
      idType: 'Voter ID (EPIC)',
      idNumber: 'AP18293041',
      status: 'Active',
      applicationDate: '2026-01-11T09:15:00.000Z',
      approvalDate: '2026-01-11T14:20:00.000Z',
      approvedBy: 'admin',
      remarks: 'Verified State General Secretary',
      createdAt: '2026-01-11T09:15:00.000Z',
      updatedAt: '2026-01-11T14:20:00.000Z',
    },
    {
      id: 'mem-103',
      applicationNo: 'APP-2026-0003',
      membershipId: 'MUD-00000003',
      fullName: 'Padmavathi Mudiraj',
      fatherName: 'Subba Rao',
      motherName: 'Parvathamma',
      dob: '1986-11-03',
      gender: 'Female',
      mobile: '9989033445',
      alternateMobile: '9989033446',
      email: 'padmavathi.m@example.org',
      photoUrl: '',
      houseNo: '8-19-12',
      street: 'Arundelpet 4th Line',
      gramamId: 'gramam-3',
      gramamName: 'Atmakur Gramam',
      mandalId: 'mandal-mangalagiri',
      mandalName: 'Mangalagiri Mandal',
      constitutionId: 'const-mangalagiri',
      constitutionName: 'Mangalagiri',
      districtId: 'dist-gnt',
      districtName: 'Guntur',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '522503',
      idType: 'Aadhaar Card',
      idNumber: '738291048576',
      status: 'Active',
      applicationDate: '2026-01-12T10:00:00.000Z',
      approvalDate: '2026-01-12T16:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'State Mahila Team President',
      createdAt: '2026-01-12T10:00:00.000Z',
      updatedAt: '2026-01-12T16:00:00.000Z',
    },
    {
      id: 'mem-104',
      applicationNo: 'APP-2026-0004',
      membershipId: 'MUD-00000004',
      fullName: 'Kiran Kumar Mudiraj',
      fatherName: 'Nageswara Rao',
      motherName: 'Sujatha',
      dob: '1996-02-18',
      gender: 'Male',
      mobile: '9701234567',
      alternateMobile: '',
      email: 'kiran.youth@example.org',
      photoUrl: '',
      houseNo: '22-91/4',
      street: 'MVP Colony Sector 5',
      gramamId: null,
      gramamName: 'MVP Ward',
      mandalId: 'mandal-vspurban',
      mandalName: 'Visakhapatnam Urban Mandal',
      constitutionId: 'const-vspeast',
      constitutionName: 'Visakhapatnam East',
      districtId: 'dist-vsp',
      districtName: 'Visakhapatnam',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '530017',
      idType: 'PAN Card',
      idNumber: 'BCMPK1234F',
      status: 'Active',
      applicationDate: '2026-01-14T11:30:00.000Z',
      approvalDate: '2026-01-14T15:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'State Youth Wing President',
      createdAt: '2026-01-14T11:30:00.000Z',
      updatedAt: '2026-01-14T15:00:00.000Z',
    },
    {
      id: 'mem-105',
      applicationNo: 'APP-2026-0005',
      membershipId: 'MUD-00000005',
      fullName: 'Mallikarjuna Rao Mudiraj',
      fatherName: 'Lingamaiah',
      motherName: 'ellamma',
      dob: '1984-07-10',
      gender: 'Male',
      mobile: '9550112244',
      alternateMobile: '',
      email: 'malli.mudiraj@example.org',
      photoUrl: '',
      houseNo: '3-112',
      street: 'Benz Circle East',
      gramamId: null,
      gramamName: 'Patamata',
      mandalId: 'mandal-vjaurban',
      mandalName: 'Vijayawada Central Mandal',
      constitutionId: 'const-vjacen',
      constitutionName: 'Vijayawada Central',
      districtId: 'dist-ntr',
      districtName: 'NTR (Vijayawada)',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '520010',
      idType: 'Aadhaar Card',
      idNumber: '657483920192',
      status: 'Active',
      applicationDate: '2026-01-18T09:00:00.000Z',
      approvalDate: '2026-01-18T12:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'NTR District President',
      createdAt: '2026-01-18T09:00:00.000Z',
      updatedAt: '2026-01-18T12:00:00.000Z',
    },
    {
      id: 'mem-106',
      applicationNo: 'APP-2026-0006',
      membershipId: 'MUD-00000006',
      fullName: 'Bhavani Shankar Mudiraj',
      fatherName: 'Satyanarayana',
      motherName: 'Kanakadurga',
      dob: '1990-12-25',
      gender: 'Male',
      mobile: '9177889900',
      alternateMobile: '',
      email: 'bhavani.s@example.org',
      photoUrl: '',
      houseNo: '14-88',
      street: 'Kapिला Theertham Road',
      gramamId: null,
      gramamName: 'Tirupati North',
      mandalId: 'mandal-tpturban',
      mandalName: 'Tirupati Urban Mandal',
      constitutionId: 'const-tirupati',
      constitutionName: 'Tirupati',
      districtId: 'dist-tpt',
      districtName: 'Tirupati',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '517501',
      idType: 'Voter ID (EPIC)',
      idNumber: 'TPT8899221',
      status: 'Active',
      applicationDate: '2026-01-20T10:00:00.000Z',
      approvalDate: '2026-01-21T10:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'State Vice President & Tirupati Coordinator',
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-01-21T10:00:00.000Z',
    },
    {
      id: 'mem-107',
      applicationNo: 'APP-2026-0007',
      membershipId: 'MUD-00000007',
      fullName: 'Anitha Kumari Mudiraj',
      fatherName: 'Govinda Rajulu',
      motherName: 'Bharathi',
      dob: '1992-04-09',
      gender: 'Female',
      mobile: '9666554433',
      alternateMobile: '',
      email: 'anitha.mudiraj@example.org',
      photoUrl: '',
      houseNo: '6-44/B',
      street: 'Kamalanagar',
      gramamId: null,
      gramamName: 'Anantapuramu Old Town',
      mandalId: 'mandal-atpurban',
      mandalName: 'Anantapuramu Urban Mandal',
      constitutionId: 'const-atpurban',
      constitutionName: 'Anantapur Urban',
      districtId: 'dist-atp',
      districtName: 'Anantapuramu',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '515001',
      idType: 'Aadhaar Card',
      idNumber: '883920192837',
      status: 'Approved',
      applicationDate: '2026-02-01T10:00:00.000Z',
      approvalDate: '2026-02-02T11:30:00.000Z',
      approvedBy: 'admin',
      remarks: 'Approved Member - Anantapuramu',
      createdAt: '2026-02-01T10:00:00.000Z',
      updatedAt: '2026-02-02T11:30:00.000Z',
    },
    {
      id: 'mem-108',
      applicationNo: 'APP-2026-0008',
      membershipId: 'MUD-00000008',
      fullName: 'Ramesh Babu Mudiraj',
      fatherName: 'Appa Rao',
      motherName: 'Satyavathi',
      dob: '1977-09-15',
      gender: 'Male',
      mobile: '9490112288',
      alternateMobile: '',
      email: 'ramesh.kkd@example.org',
      photoUrl: '',
      houseNo: '19-2-11',
      street: 'Bhanugudi Junction',
      gramamId: null,
      gramamName: 'Sarpavaram',
      mandalId: 'mandal-kkdurban',
      mandalName: 'Kakinada Urban Mandal',
      constitutionId: 'const-kkdcity',
      constitutionName: 'Kakinada City',
      districtId: 'dist-kkd',
      districtName: 'Kakinada',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '533003',
      idType: 'Aadhaar Card',
      idNumber: '594837261524',
      status: 'Inactive',
      applicationDate: '2026-02-04T10:00:00.000Z',
      approvalDate: '2026-02-05T09:00:00.000Z',
      approvedBy: 'admin',
      remarks: 'Temporarily relocated outside district',
      createdAt: '2026-02-04T10:00:00.000Z',
      updatedAt: '2026-02-10T09:00:00.000Z',
    },
    // Pending Applications awaiting Admin review
    {
      id: 'mem-109',
      applicationNo: 'APP-2026-0009',
      membershipId: null,
      fullName: 'Nagaraju Mudiraj',
      fatherName: 'Chennaiah Mudiraj',
      motherName: 'Yellamma',
      dob: '1995-06-12',
      gender: 'Male',
      mobile: '9391002233',
      alternateMobile: '9391002234',
      email: 'nagaraju.knl@example.org',
      photoUrl: '',
      houseNo: '11-55',
      street: 'Budhawarapeta',
      gramamId: null,
      gramamName: 'Kallur Estate',
      mandalId: 'mandal-kallur',
      mandalName: 'Kallur Mandal',
      constitutionId: 'const-kurnool',
      constitutionName: 'Kurnool Urban',
      districtId: 'dist-knl',
      districtName: 'Kurnool',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '518002',
      idType: 'Aadhaar Card',
      idNumber: '918273645546',
      status: 'Pending',
      applicationDate: '2026-09-24T10:15:00.000Z',
      approvalDate: null,
      approvedBy: null,
      remarks: 'Submitted via Online Public Portal',
      createdAt: '2026-09-24T10:15:00.000Z',
      updatedAt: '2026-09-24T10:15:00.000Z',
    },
    {
      id: 'mem-110',
      applicationNo: 'APP-2026-0010',
      membershipId: null,
      fullName: 'Swaroopa Rani Mudiraj',
      fatherName: 'Koteswara Rao',
      motherName: 'Annapurna',
      dob: '1998-01-20',
      gender: 'Female',
      mobile: '9000112299',
      alternateMobile: '',
      email: 'swaroopa.gnt@example.org',
      photoUrl: '',
      houseNo: '4-89/C',
      street: 'Lakshmipuram 2nd Lane',
      gramamId: null,
      gramamName: 'Nallapadu',
      mandalId: 'mandal-gntwest',
      mandalName: 'Guntur West Mandal',
      constitutionId: 'const-gntwest',
      constitutionName: 'Guntur West',
      districtId: 'dist-gnt',
      districtName: 'Guntur',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '522007',
      idType: 'Voter ID (EPIC)',
      idNumber: 'GNT9988112',
      status: 'Pending',
      applicationDate: '2026-09-25T14:40:00.000Z',
      approvalDate: null,
      approvedBy: null,
      remarks: 'Interested in Mahila Team volunteer work',
      createdAt: '2026-09-25T14:40:00.000Z',
      updatedAt: '2026-09-25T14:40:00.000Z',
    },
    {
      id: 'mem-111',
      applicationNo: 'APP-2026-0011',
      membershipId: null,
      fullName: 'Prabhakar Rao Mudiraj',
      fatherName: 'Subbarayudu',
      motherName: 'Narayanamma',
      dob: '1989-03-30',
      gender: 'Male',
      mobile: '9885443322',
      alternateMobile: '',
      email: 'prabhakar.nlr@example.org',
      photoUrl: '',
      houseNo: '7-12-9',
      street: 'Magunta Layout',
      gramamId: null,
      gramamName: 'Dargamitta',
      mandalId: 'mandal-nlrurban',
      mandalName: 'Nellore Urban Mandal',
      constitutionId: 'const-nlrcity',
      constitutionName: 'Nellore City',
      districtId: 'dist-nlr',
      districtName: 'SPSR Nellore',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '524003',
      idType: 'Aadhaar Card',
      idNumber: '334455667788',
      status: 'Pending',
      applicationDate: '2026-09-25T17:10:00.000Z',
      approvalDate: null,
      approvedBy: null,
      remarks: 'Submitted online application',
      createdAt: '2026-09-25T17:10:00.000Z',
      updatedAt: '2026-09-25T17:10:00.000Z',
    },
    {
      id: 'mem-112',
      applicationNo: 'APP-2026-0012',
      membershipId: null,
      fullName: 'Suresh Kumar',
      fatherName: 'Rajendra Prasad',
      motherName: 'Kamala',
      dob: '1993-10-05',
      gender: 'Male',
      mobile: '9123456780',
      alternateMobile: '',
      email: '',
      photoUrl: '',
      houseNo: '1-22',
      street: 'Tagarapuvalasa',
      gramamId: null,
      gramamName: 'Chittivalasa',
      mandalId: 'mandal-bheemili',
      mandalName: 'Bheemunipatnam Mandal',
      constitutionId: 'const-bheemili',
      constitutionName: 'Bheemunipatnam',
      districtId: 'dist-vsp',
      districtName: 'Visakhapatnam',
      stateId: 'state-ap',
      stateName: 'Andhra Pradesh',
      pincode: '531162',
      idType: 'Driving License',
      idNumber: 'AP3120190012345',
      status: 'Rejected',
      applicationDate: '2026-09-10T11:00:00.000Z',
      approvalDate: null,
      approvedBy: 'admin',
      remarks: 'Incomplete community certificate verification details; advised to reapply with valid ID.',
      createdAt: '2026-09-10T11:00:00.000Z',
      updatedAt: '2026-09-12T15:00:00.000Z',
    },
  ];

  // 8. Sample Leadership Assignments (TeamMember records)
  const teamMembers = [
    {
      id: 'tm-1',
      teamId: 'team-state-ap-main-team',
      memberId: 'mem-101',
      membershipId: 'MUD-00000001',
      positionCode: 'PRESIDENT',
      positionTitle: 'President / Chairman',
      slotNumber: 1,
      assignedAt: '2026-01-15T10:00:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
    {
      id: 'tm-2',
      teamId: 'team-state-ap-main-team',
      memberId: 'mem-102',
      membershipId: 'MUD-00000002',
      positionCode: 'GENERAL_SECRETARY',
      positionTitle: 'General Secretary',
      slotNumber: 1,
      assignedAt: '2026-01-15T10:05:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
    {
      id: 'tm-3',
      teamId: 'team-state-ap-main-team',
      memberId: 'mem-106',
      membershipId: 'MUD-00000006',
      positionCode: 'VICE_PRESIDENT',
      positionTitle: 'Vice President',
      slotNumber: 1,
      assignedAt: '2026-01-22T10:00:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
    {
      id: 'tm-4',
      teamId: 'team-state-ap-mahila-team',
      memberId: 'mem-103',
      membershipId: 'MUD-00000003',
      positionCode: 'PRESIDENT',
      positionTitle: 'President / Chairman',
      slotNumber: 1,
      assignedAt: '2026-01-16T11:00:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
    {
      id: 'tm-5',
      teamId: 'team-state-ap-youth-team',
      memberId: 'mem-104',
      membershipId: 'MUD-00000004',
      positionCode: 'PRESIDENT',
      positionTitle: 'President / Chairman',
      slotNumber: 1,
      assignedAt: '2026-01-16T11:30:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
    {
      id: 'tm-6',
      teamId: 'team-dist-ntr-main-team',
      memberId: 'mem-105',
      membershipId: 'MUD-00000005',
      positionCode: 'PRESIDENT',
      positionTitle: 'President / Chairman',
      slotNumber: 1,
      assignedAt: '2026-01-19T09:30:00.000Z',
      assignedBy: 'admin',
      status: 'Active',
    },
  ];

  // 9. Audit Logs
  const auditLogs = [
    {
      id: 'log-1',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: 'state-ap',
      actor: 'system',
      details: 'Initialized Andhra Pradesh Mudiraj Community Database with 8 Districts, 13 Constitutions, 17 Mandals, and Reusable Teams.',
      createdAt: '2026-01-01T09:00:00.000Z',
    },
    {
      id: 'log-2',
      action: 'APPLICATION_APPROVED',
      entityType: 'Member',
      entityId: 'mem-101',
      actor: 'admin',
      details: 'Approved application APP-2026-0001 and generated Membership ID MUD-00000001 for Chandu Anna Mudiraj.',
      createdAt: '2026-01-10T11:00:00.000Z',
    },
    {
      id: 'log-3',
      action: 'LEADER_ASSIGNED',
      entityType: 'TeamMember',
      entityId: 'tm-1',
      actor: 'admin',
      details: 'Assigned Chandu Anna Mudiraj (MUD-00000001) as President / Chairman of Andhra Pradesh State Main Team.',
      createdAt: '2026-01-15T10:00:00.000Z',
    },
  ];

  return {
    meta: {
      version: '1.0.0',
      databaseEngine: 'Local Persistent JSON Adapter (SQL-Ready Architecture)',
      maxDesignedCapacity: 2000000,
      createdAt: now,
      updatedAt: now,
    },
    sequences: {
      membershipId: 8, // Next approved member receives MUD-00000009
      applicationNo: 12, // Next application receives APP-2026-0013
    },
    admins,
    states,
    districts,
    constitutions,
    mandals,
    gramams,
    teams,
    members,
    teamMembers,
    auditLogs,
  };
}

/**
 * Loads database from disk (or initializes seed data if not found).
 */
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
      return memoryCache;
    }
  } catch (err) {
    console.error('Warning reading local database file, falling back to seed:', err.message);
  }

  memoryCache = createInitialSeedDatabase();
  saveDatabase(memoryCache);
  return memoryCache;
}

/**
 * Persists database state atomically to disk.
 */
export function saveDatabase(dbState = memoryCache) {
  if (!dbState) return;
  dbState.meta.updatedAt = new Date().toISOString();
  memoryCache = dbState;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbState, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE_PATH);
  } catch (err) {
    console.error('Error saving database file:', err.message);
  }
}

/**
 * Records an audit log entry.
 */
export function recordAuditLog({ action, entityType, entityId, actor = 'admin', details = '' }) {
  const db = getDatabase();
  const logEntry = {
    id: generateUuid('log'),
    action,
    entityType,
    entityId,
    actor,
    details,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
  return logEntry;
}

/**
 * Database Adapter Interface used by `lib/membershipId.js` and services.
 */
export const dbAdapter = {
  incrementSequence(sequenceKey) {
    const db = getDatabase();
    if (typeof db.sequences[sequenceKey] !== 'number') {
      db.sequences[sequenceKey] = 0;
    }
    db.sequences[sequenceKey] += 1;
    saveDatabase(db);
    return db.sequences[sequenceKey];
  },

  isMembershipIdTaken(membershipId) {
    const db = getDatabase();
    return db.members.some((m) => m.membershipId === membershipId);
  },
};
