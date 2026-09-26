'use client';

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, CreditCard, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { VALID_GENDERS, VALID_ID_TYPES } from '@/lib/validation';

export default function MemberForm({
  hierarchy,
  isAdminMode = false,
  onSuccess = null,
}) {
  const districts = hierarchy?.districts || [];
  const allConstitutions = hierarchy?.constitutions || [];
  const allMandals = hierarchy?.mandals || [];

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    mobile: '',
    alternateMobile: '',
    email: '',
    photoUrl: '',
    houseNo: '',
    street: '',
    gramamName: '',
    districtId: districts[0]?.id || '',
    constitutionId: '',
    mandalId: '',
    stateName: 'Andhra Pradesh',
    pincode: '',
    idType: 'Aadhaar Card',
    idNumber: '',
    remarks: '',
    autoApprove: isAdminMode,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);

  // Filter Constitutions by selected District
  const availableConstitutions = allConstitutions.filter(
    (c) => c.districtId === formData.districtId
  );

  // Filter Mandals by selected Constitution
  const availableMandals = allMandals.filter(
    (m) => m.constitutionId === formData.constitutionId
  );

  useEffect(() => {
    if (formData.districtId) {
      const matchingConst = allConstitutions.filter((c) => c.districtId === formData.districtId);
      const firstConstId = matchingConst[0]?.id || '';
      setFormData((prev) => ({
        ...prev,
        constitutionId: firstConstId,
      }));
    }
  }, [formData.districtId]);

  useEffect(() => {
    if (formData.constitutionId) {
      const matchingMandals = allMandals.filter(
        (m) => m.constitutionId === formData.constitutionId
      );
      const firstMandalId = matchingMandals[0]?.id || '';
      setFormData((prev) => ({
        ...prev,
        mandalId: firstMandalId,
      }));
    }
  }, [formData.constitutionId]);

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
      <div className="card" style={{ borderTop: '4px solid var(--success)', maxWidth: '760px', margin: '0 auto' }}>
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
              <span style={{ color: 'var(--text-muted)' }}>Applicant Full Name:</span>
              <div style={{ fontWeight: 600 }}>{submittedRecord.fullName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location Hierarchy:</span>
              <div style={{ fontWeight: 600 }}>
                {submittedRecord.gramamName}, {submittedRecord.mandalName}, {submittedRecord.constitutionName}, {submittedRecord.districtName}
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
                fatherName: '',
                motherName: '',
                dob: '',
                mobile: '',
                alternateMobile: '',
                email: '',
                photoUrl: '',
                houseNo: '',
                street: '',
                gramamName: '',
                pincode: '',
                idNumber: '',
                remarks: '',
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
    <form onSubmit={handleSubmit} className="card" noValidate>
      {serverError && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{serverError}</div>
        </div>
      )}

      {/* 1. PERSONAL DETAILS */}
      <div className="form-section">
        <div className="form-section-title">
          <UserCheck size={18} />
          <span>1. Personal Details</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name (పూర్తి పేరు) <span className="required-star">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-control"
              placeholder="Enter full name as per ID"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fatherName">
              Father Name (తండ్రి పేరు) <span className="required-star">*</span>
            </label>
            <input
              id="fatherName"
              name="fatherName"
              type="text"
              className="form-control"
              placeholder="Enter father's full name"
              value={formData.fatherName}
              onChange={handleChange}
              required
            />
            {errors.fatherName && <span className="form-error">{errors.fatherName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="motherName">
              Mother Name (తల్లి పేరు) <span className="required-star">*</span>
            </label>
            <input
              id="motherName"
              name="motherName"
              type="text"
              className="form-control"
              placeholder="Enter mother's full name"
              value={formData.motherName}
              onChange={handleChange}
              required
            />
            {errors.motherName && <span className="form-error">{errors.motherName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dob">
              Date of Birth (పుట్టిన తేదీ) <span className="required-star">*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              className="form-control"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            {errors.dob && <span className="form-error">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Gender (లింగం) <span className="required-star">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              className="form-control"
              value={formData.gender}
              onChange={handleChange}
            >
              {VALID_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Mobile Number (మొబైల్ నంబర్) <span className="required-star">*</span>
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              maxLength={10}
              className="form-control"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
            {errors.mobile && <span className="form-error">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="alternateMobile">
              Alternate Mobile Number
            </label>
            <input
              id="alternateMobile"
              name="alternateMobile"
              type="tel"
              maxLength={10}
              className="form-control"
              placeholder="Optional secondary number"
              value={formData.alternateMobile}
              onChange={handleChange}
            />
            {errors.alternateMobile && <span className="form-error">{errors.alternateMobile}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="name@example.com (Optional)"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="photoUpload">
              Member Passport Photo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                htmlFor="photoUpload"
                className="btn btn-outline btn-sm"
                style={{ cursor: 'pointer', flex: 1 }}
              >
                <Upload size={14} /> Upload Photo
              </label>
              <input
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    border: '1px solid var(--border-strong)',
                  }}
                />
              )}
            </div>
            {errors.photoUrl && <span className="form-error">{errors.photoUrl}</span>}
          </div>
        </div>
      </div>

      {/* 2. ADDRESS & ORGANIZATIONAL HIERARCHY DETAILS */}
      <div className="form-section">
        <div className="form-section-title">
          <MapPin size={18} />
          <span>2. Address &amp; Organizational Jurisdiction</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="stateName">
              State (రాష్ట్రం) <span className="required-star">*</span>
            </label>
            <input
              id="stateName"
              name="stateName"
              type="text"
              className="form-control"
              value="Andhra Pradesh"
              readOnly
            />
            <span className="form-hint">Currently active for Andhra Pradesh State</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="districtId">
              District (జిల్లా) <span className="required-star">*</span>
            </label>
            <select
              id="districtId"
              name="districtId"
              className="form-control"
              value={formData.districtId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select District --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {errors.districtId && <span className="form-error">{errors.districtId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="constitutionId">
              Constitution (నియోజకవర్గం) <span className="required-star">*</span>
            </label>
            <select
              id="constitutionId"
              name="constitutionId"
              className="form-control"
              value={formData.constitutionId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Constitution --</option>
              {availableConstitutions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
            {errors.constitutionId && <span className="form-error">{errors.constitutionId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mandalId">
              Mandal (మండలం) <span className="required-star">*</span>
            </label>
            <select
              id="mandalId"
              name="mandalId"
              className="form-control"
              value={formData.mandalId}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Mandal --</option>
              {availableMandals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors.mandalId && <span className="form-error">{errors.mandalId}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gramamName">
              Village / Gramam (గ్రామం / వార్డు) <span className="required-star">*</span>
            </label>
            <input
              id="gramamName"
              name="gramamName"
              type="text"
              className="form-control"
              placeholder="Enter Village / Gramam name"
              value={formData.gramamName}
              onChange={handleChange}
              required
            />
            {errors.gramamName && <span className="form-error">{errors.gramamName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="houseNo">
              House / Door Number (ఇంటి నంబర్) <span className="required-star">*</span>
            </label>
            <input
              id="houseNo"
              name="houseNo"
              type="text"
              className="form-control"
              placeholder="e.g. 12-4-88/A"
              value={formData.houseNo}
              onChange={handleChange}
              required
            />
            {errors.houseNo && <span className="form-error">{errors.houseNo}</span>}
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="street">
              Street / Colony / Landmark (వీధి / కాలనీ) <span className="required-star">*</span>
            </label>
            <input
              id="street"
              name="street"
              type="text"
              className="form-control"
              placeholder="Enter street name or locality"
              value={formData.street}
              onChange={handleChange}
              required
            />
            {errors.street && <span className="form-error">{errors.street}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pincode">
              Pincode (పిన్‌కోడ్) <span className="required-star">*</span>
            </label>
            <input
              id="pincode"
              name="pincode"
              type="text"
              maxLength={6}
              className="form-control"
              placeholder="6-digit Pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
          </div>
        </div>
      </div>

      {/* 3. GOVERNMENT ID DETAILS */}
      <div className="form-section">
        <div className="form-section-title">
          <CreditCard size={18} />
          <span>3. Identity Verification Details</span>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="idType">
              ID Proof Type <span className="required-star">*</span>
            </label>
            <select
              id="idType"
              name="idType"
              className="form-control"
              value={formData.idType}
              onChange={handleChange}
            >
              {VALID_ID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="idNumber">
              ID Number <span className="required-star">*</span>
            </label>
            <input
              id="idNumber"
              name="idNumber"
              type="text"
              className="form-control"
              placeholder={
                formData.idType === 'Aadhaar Card'
                  ? '12-digit Aadhaar Number'
                  : 'Enter Government ID Number'
              }
              value={formData.idNumber}
              onChange={handleChange}
              required
            />
            <span className="form-hint">
              Kept strictly confidential; never displayed publicly.
            </span>
            {errors.idNumber && <span className="form-error">{errors.idNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="remarks">
              Additional Remarks / Notes
            </label>
            <input
              id="remarks"
              name="remarks"
              type="text"
              className="form-control"
              placeholder="Optional notes or volunteer interest"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
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
            ? 'Submitting Application...'
            : isAdminMode
            ? 'Register Member'
            : 'Submit Membership Application'}
        </button>
      </div>
    </form>
  );
}
