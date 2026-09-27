'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UserCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { VALID_GENDERS, MEMBER_TEAM_TYPE_OPTIONS } from '@/lib/validation';
import { AP_COMPLETE_HIERARCHY } from '@/lib/apHierarchyData';

export default function MemberForm({
  isAdminMode = false,
  onSuccess = null,
}) {
  const defaultDistrict = AP_COMPLETE_HIERARCHY[0]?.district || '';
  const defaultConstituency =
    AP_COMPLETE_HIERARCHY[0]?.constituencies[0]?.name || '';
  const defaultMandal =
    AP_COMPLETE_HIERARCHY[0]?.constituencies[0]?.mandals[0] || '';

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Male',
    mobile: '',
    email: '',
    passportNumber: '',
    photoUrl: '',
    pincode: '',
    memberTeamType: 'State',
    stateName: 'Andhra Pradesh',
    districtName: defaultDistrict,
    constitutionName: defaultConstituency,
    mandalName: defaultMandal,
    autoApprove: isAdminMode,
  });

  // Searchable Team Type Dropdown State (matching screenshot)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [hoveredOption, setHoveredOption] = useState('State');
  const dropdownRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive active District object from AP_COMPLETE_HIERARCHY
  const selectedDistrictObj =
    AP_COMPLETE_HIERARCHY.find((d) => d.district === formData.districtName) ||
    AP_COMPLETE_HIERARCHY[0];

  // Derive Constituencies for the selected District
  const availableConstituencies = selectedDistrictObj?.constituencies || [];

  // Derive active Constituency object
  const selectedConstituencyObj =
    availableConstituencies.find((c) => c.name === formData.constitutionName) ||
    availableConstituencies[0];

  // Derive Mandals for the selected Constituency
  const availableMandals = selectedConstituencyObj?.mandals || [];

  const filteredTeamOptions = MEMBER_TEAM_TYPE_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(teamSearch.trim().toLowerCase())
  );

  // Determine which cascading dropdowns to show based on Team Type:
  // - State -> 1 dropdown (State)
  // - District -> 2 dropdowns (State, District)
  // - Constituency -> 3 dropdowns (State, District, Constituency)
  // - Mandal Main / Mandal Youth / Mandal Mahila -> 4 dropdowns (State, District, Constituency, Mandal)
  const showStateDropdown = Boolean(formData.memberTeamType);
  const showDistrictDropdown = [
    'District',
    'Constituency',
    'Mandal Main',
    'Mandal Youth',
    'Mandal Mahila',
  ].includes(formData.memberTeamType);
  const showConstituencyDropdown = [
    'Constituency',
    'Mandal Main',
    'Mandal Youth',
    'Mandal Mahila',
  ].includes(formData.memberTeamType);
  const showMandalDropdown = [
    'Mandal Main',
    'Mandal Youth',
    'Mandal Mahila',
  ].includes(formData.memberTeamType);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleDistrictChange(e) {
    const newDistrictName = e.target.value;
    const distObj = AP_COMPLETE_HIERARCHY.find(
      (d) => d.district === newDistrictName
    );
    const firstConstObj = distObj?.constituencies?.[0] || null;
    const firstMandalName = firstConstObj?.mandals?.[0] || '';

    setFormData((prev) => ({
      ...prev,
      districtName: newDistrictName,
      constitutionName: firstConstObj ? firstConstObj.name : '',
      mandalName: firstMandalName,
    }));
    setErrors((prev) => ({
      ...prev,
      districtName: '',
      constitutionName: '',
      mandalName: '',
    }));
  }

  function handleConstituencyChange(e) {
    const newConstName = e.target.value;
    const constObj = availableConstituencies.find(
      (c) => c.name === newConstName
    );
    const firstMandalName = constObj?.mandals?.[0] || '';

    setFormData((prev) => ({
      ...prev,
      constitutionName: newConstName,
      mandalName: firstMandalName,
    }));
    setErrors((prev) => ({
      ...prev,
      constitutionName: '',
      mandalName: '',
    }));
  }

  function handleSelectTeamType(option) {
    setFormData((prev) => ({
      ...prev,
      memberTeamType: option,
      stateName: 'Andhra Pradesh',
      districtName: prev.districtName || defaultDistrict,
      constitutionName: prev.constitutionName || defaultConstituency,
      mandalName: prev.mandalName || defaultMandal,
    }));
    setHoveredOption(option);
    setDropdownOpen(false);
    setTeamSearch('');
    if (errors.memberTeamType) {
      setErrors((prev) => ({ ...prev, memberTeamType: '' }));
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photoUrl: 'Please select a valid image file (JPG/PNG).' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photoUrl: 'Photo size must be under 2 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photoUrl: String(reader.result || '') }));
      setErrors((prev) => ({ ...prev, photoUrl: '' }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setErrors({});
    setSubmitting(true);

    try {
      const endpoint = isAdminMode ? '/api/admin/members' : '/api/public/apply';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.validationErrors) {
          setErrors(data.validationErrors);
        }
        setServerError(data.error || 'Please fix the highlighted errors before submitting.');
        setSubmitting(false);
        return;
      }

      const resultObj = data.application || data.member;
      setSubmittedRecord(resultObj);
      setSubmitting(false);
      if (onSuccess) {
        onSuccess(resultObj);
      }
    } catch (err) {
      setServerError(err.message || 'Network error while submitting form.');
      setSubmitting(false);
    }
  }

  if (submittedRecord && !isAdminMode) {
    return (
      <div className="card" style={{ borderTop: '4px solid var(--success)', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <CheckCircle2 size={36} color="var(--success)" />
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--success)' }}>
              Membership Application Submitted Successfully!
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Your application is now in <strong>Pending</strong> status for Administrator verification.
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-muted)',
            padding: '18px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px',
          }}
        >
          <div className="grid-2" style={{ gap: '12px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Application Number:</span>
              <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--primary)' }}>
                {submittedRecord.applicationNo}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Application Status:</span>
              <div>
                <span className="badge badge-pending">{submittedRecord.status}</span>
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
              <div style={{ fontWeight: 600 }}>{submittedRecord.fullName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Team Type &amp; Jurisdiction:</span>
              <div style={{ fontWeight: 600 }}>
                {formData.memberTeamType} —{' '}
                {[
                  showMandalDropdown ? formData.mandalName : null,
                  showConstituencyDropdown ? formData.constitutionName : null,
                  showDistrictDropdown ? formData.districtName : null,
                  formData.stateName,
                ]
                  .filter(Boolean)
                  .join(' › ')}
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Please save your Application Number (<strong>{submittedRecord.applicationNo}</strong>). Once an
          Administrator approves your application, your permanent unique Membership ID (Format:{' '}
          <code>MUD-00000001</code>) will be generated and your status will become <strong>Active</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSubmittedRecord(null);
              setFormData((prev) => ({
                ...prev,
                fullName: '',
                mobile: '',
                email: '',
                passportNumber: '',
                photoUrl: '',
                pincode: '',
              }));
            }}
          >
            Submit Another Application
          </button>
          <a href={`/membership?query=${encodeURIComponent(submittedRecord.applicationNo)}`} className="btn btn-outline">
            Track Application Status
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ maxWidth: '860px', margin: '0 auto' }} noValidate>
      {serverError && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{serverError}</div>
        </div>
      )}

      <div className="form-section">
        <div className="form-section-title">
          <UserCheck size={18} />
          <span>Member Registration Details</span>
        </div>

        <div className="form-grid-2">
          {/* 1. Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-control"
              placeholder="Enter Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          {/* 2. Gender */}
          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Gender <span className="required-star">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              {VALID_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>

          {/* 3. Mobile Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Mobile Number <span className="required-star">*</span>
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              maxLength={10}
              className="form-control"
              placeholder="10-digit Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
            {errors.mobile && <span className="form-error">{errors.mobile}</span>}
          </div>

          {/* 4. Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* 5. Passport (Photo / Details) */}
          <div className="form-group">
            <label className="form-label" htmlFor="passportUpload">
              Passport (Photo / ID)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                id="passportNumber"
                name="passportNumber"
                type="text"
                className="form-control"
                placeholder="Passport No. (or upload photo)"
                value={formData.passportNumber}
                onChange={handleChange}
              />
              <label
                htmlFor="passportUpload"
                className="btn btn-outline btn-sm"
                style={{ cursor: 'pointer', flexShrink: 0 }}
              >
                <Upload size={14} /> Photo
              </label>
              <input
                id="passportUpload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  alt="Passport Preview"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-strong)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
            {errors.photoUrl && <span className="form-error">{errors.photoUrl}</span>}
          </div>

          {/* 6. PinCode */}
          <div className="form-group">
            <label className="form-label" htmlFor="pincode">
              PinCode <span className="required-star">*</span>
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              maxLength={6}
              className="form-control"
              placeholder="6-digit PinCode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
          </div>
        </div>
      </div>

      {/* TEAM TYPE & DYNAMIC CASCADING HIERARCHY SECTION */}
      <div className="form-section">
        <div className="form-section-title">
          <MapPin size={18} />
          <span>Team Type &amp; Andhra Pradesh Jurisdiction Selection</span>
        </div>

        <div className="form-grid-2">
          {/* Searchable Team Type Dropdown */}
          <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <label className="form-label">
              Select Team Type <span className="required-star">*</span>
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="form-control"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                cursor: 'pointer',
                background: '#ffffff',
                fontWeight: 600,
              }}
            >
              <span>{formData.memberTeamType || 'Select Team Type'}</span>
              <ChevronDown size={16} color="#64748b" />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '100%',
                  minWidth: '280px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow:
                    '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
                  padding: '10px',
                  zIndex: 60,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    marginBottom: '8px',
                  }}
                >
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search team type..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    autoFocus
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '14px',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filteredTeamOptions.length === 0 ? (
                    <div style={{ padding: '10px 14px', fontSize: '13px', color: '#94a3b8' }}>
                      No matching team type found
                    </div>
                  ) : (
                    filteredTeamOptions.map((option) => {
                      const isHighlighted =
                        hoveredOption === option || formData.memberTeamType === option;
                      return (
                        <div
                          key={option}
                          onMouseEnter={() => setHoveredOption(option)}
                          onClick={() => handleSelectTeamType(option)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: formData.memberTeamType === option ? 600 : 400,
                            color: '#0f172a',
                            background: isHighlighted ? '#f3f4f6' : 'transparent',
                            transition: 'background-color 0.12s',
                          }}
                        >
                          {option}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {errors.memberTeamType && (
              <span className="form-error">{errors.memberTeamType}</span>
            )}
          </div>

          {/* Dropdown 1: Select State (Always shown when any Team Type is selected) */}
          {showStateDropdown && (
            <div className="form-group">
              <label className="form-label" htmlFor="stateName">
                Select State <span className="required-star">*</span>
              </label>
              <select
                id="stateName"
                name="stateName"
                className="form-control"
                value={formData.stateName}
                onChange={handleChange}
                required
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
              </select>
              {errors.stateName && <span className="form-error">{errors.stateName}</span>}
            </div>
          )}

          {/* Dropdown 2: Select District (Shown when District, Constituency, or Mandal Main/Youth/Mahila is selected) */}
          {showDistrictDropdown && (
            <div className="form-group">
              <label className="form-label" htmlFor="districtName">
                Select District (Andhra Pradesh — 26 Districts) <span className="required-star">*</span>
              </label>
              <select
                id="districtName"
                name="districtName"
                className="form-control"
                value={formData.districtName}
                onChange={handleDistrictChange}
                required
              >
                {AP_COMPLETE_HIERARCHY.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
              {errors.districtName && <span className="form-error">{errors.districtName}</span>}
            </div>
          )}

          {/* Dropdown 3: Select Constituency (Shown when Constituency or Mandal Main/Youth/Mahila is selected) */}
          {showConstituencyDropdown && (
            <div className="form-group">
              <label className="form-label" htmlFor="constitutionName">
                Select Constituency ({formData.districtName} District){' '}
                <span className="required-star">*</span>
              </label>
              <select
                id="constitutionName"
                name="constitutionName"
                className="form-control"
                value={formData.constitutionName}
                onChange={handleConstituencyChange}
                required
              >
                {availableConstituencies.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.constitutionName && (
                <span className="form-error">{errors.constitutionName}</span>
              )}
            </div>
          )}

          {/* Dropdown 4: Select Mandal (Shown when Mandal Main, Mandal Youth, or Mandal Mahila is selected) */}
          {showMandalDropdown && (
            <div className="form-group">
              <label className="form-label" htmlFor="mandalName">
                Select Mandal ({formData.constitutionName} Constituency){' '}
                <span className="required-star">*</span>
              </label>
              <select
                id="mandalName"
                name="mandalName"
                className="form-control"
                value={formData.mandalName}
                onChange={handleChange}
                required
              >
                {availableMandals.map((mName) => (
                  <option key={mName} value={mName}>
                    {mName}
                  </option>
                ))}
              </select>
              {errors.mandalName && <span className="form-error">{errors.mandalName}</span>}
            </div>
          )}
        </div>
      </div>

      {isAdminMode && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--primary-light)',
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <input
            id="autoApprove"
            name="autoApprove"
            type="checkbox"
            checked={formData.autoApprove}
            onChange={handleChange}
          />
          <label htmlFor="autoApprove" style={{ fontSize: '14px', fontWeight: 600 }}>
            Immediately approve member and generate permanent Membership ID (MUD-XXXXXXXX)
          </label>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {submitting
            ? 'Submitting...'
            : isAdminMode
            ? 'Add Member'
            : 'Submit Membership Application'}
        </button>
      </div>
    </form>
  );
}
