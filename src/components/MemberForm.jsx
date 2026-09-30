'use client';

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, CreditCard, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  VALID_GENDERS,
  VALID_ID_TYPES,
  VALID_BLOOD_GROUPS,
  extractTenDigitMobile,
  formatIndianMobile,
} from '@/lib/validation';

export default function MemberForm({
  hierarchy,
  isAdminMode = false,
  onSuccess = null,
  initialData = null,
  isEditMode = false,
}) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    fatherName: initialData?.fatherName || '',
    motherName: initialData?.motherName || '',
    dob: initialData?.dob || '',
    gender: initialData?.gender || 'Male',
    bloodGroup: initialData?.bloodGroup || 'Unknown',
    occupation: initialData?.occupation || '',
    mobile: extractTenDigitMobile(initialData?.mobile || ''),
    alternateMobile: initialData?.alternateMobile || '',
    email: initialData?.email || '',
    photoUrl: initialData?.photoUrl || '',
    houseNo: initialData?.houseNo || '',
    street: initialData?.street || '',
    orgUnitId: initialData?.orgUnitId || '',
    pincode: initialData?.pincode || '',
    idType: initialData?.idType || 'Aadhaar Card',
    idNumber: initialData?.idNumber || '',
    remarks: initialData?.remarks || '',
    autoApprove: isAdminMode,
  });

  const [selectedParents, setSelectedParents] = useState(() => {
    if (initialData) {
      return {
        District: initialData.districtId || '',
        Constitution: initialData.constitutionId || '',
        Mandal: initialData.mandalId || '',
      };
    }
    return {};
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState(null);
  const [fetchingPincode, setFetchingPincode] = useState(false);

  useEffect(() => {
    async function fetchPincodeDetails() {
      if (formData.pincode && formData.pincode.length === 6) {
        setFetchingPincode(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            if (postOffices && postOffices.length > 0) {
              const po = postOffices[0];
              // Suggest a detailed address format based on the postal code
              const suggestedAddress = `${po.Name}, ${po.Block}, ${po.District}, ${po.State}`;
              setFormData(prev => ({
                ...prev,
                // Only overwrite if street is currently empty to avoid wiping out user edits
                street: prev.street ? prev.street : suggestedAddress
              }));
            }
          }
        } catch (err) {
          console.error("Failed to fetch pincode details", err);
        } finally {
          setFetchingPincode(false);
        }
      }
    }
    fetchPincodeDetails();
  }, [formData.pincode]);

  const handleParentSelect = (levelRank, unitId) => {
    const newParents = { ...selectedParents, [levelRank]: unitId };
    Object.keys(newParents).forEach(key => {
      if (parseInt(key) > levelRank) {
        delete newParents[key];
      }
    });
    setSelectedParents(newParents);
    
    // Set the orgUnitId to the most granular selected unit
    const highestRank = Math.max(...Object.keys(newParents).map(k => parseInt(k)));
    setFormData(prev => ({ ...prev, orgUnitId: newParents[highestRank] }));
  };

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const finalValue =
      type === 'checkbox'
        ? checked
        : name === 'mobile'
        ? extractTenDigitMobile(value)
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
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

  function validateForm() {
    const newErrors = {};
    
    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters long.";
    }
    
    if (!formData.bloodGroup || formData.bloodGroup === 'Unknown') {
      newErrors.bloodGroup = "Please select a valid Blood Group.";
    }

    if (!formData.occupation || formData.occupation.trim().length < 2) {
      newErrors.occupation = "Please enter your Occupation.";
    }
    
    const mobileClean = extractTenDigitMobile(formData.mobile);
    if (!/^[6-9]\d{9}$/.test(mobileClean)) {
      newErrors.mobile = "Please enter a valid 10-digit Indian (+91) mobile number.";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.photoUrl) {
      newErrors.photoUrl = "Passport photo is mandatory.";
    }
    
    const idClean = formData.idNumber.replace(/\s+/g, '');
    if (!/^[2-9]{1}[0-9]{11}$/.test(idClean)) {
      newErrors.idNumber = "Aadhaar Number must be 12 digits and cannot start with 0 or 1.";
    }
    
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit Pincode.";
    }
    
    if (!formData.street || formData.street.trim().length < 2) {
      newErrors.street = "Street / Colony name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setErrors({});
    if (!validateForm()) {
       setServerError('Please fix the errors in the form before submitting.');
       return;
    }

    // Everyone submits directly now. (Public users will get 'Pending' status on backend)
    await processSubmission({
      ...formData,
      mobile: formatIndianMobile(formData.mobile),
    });
  }

  async function processSubmission(payload) {
    setSubmitting(true);
    try {
      const endpoint = isAdminMode ? '/api/admin/members' : '/api/public/apply';
      const fetchOptions = {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditMode ? { memberId: initialData.id, updates: payload } : payload),
      };
      const res = await fetch(endpoint, fetchOptions);
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
            {submittedRecord.occupation && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Occupation:</span>
                <div style={{ fontWeight: 600 }}>{submittedRecord.occupation}</div>
              </div>
            )}
            {submittedRecord.email && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
                <div style={{ fontWeight: 600 }}>{submittedRecord.email}</div>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Please save your Application Number (<strong>{submittedRecord.applicationNo}</strong>). Once an
          Administrator approves your application, your permanent unique <strong>Membership ID</strong> (Format:{' '}
          <code>MUD-00000001</code>) and <strong>Password</strong> (first 3 letters of last name + first 3 digits of mobile number)
          will be generated, saved in the database, and sent via SMS text message to your Mobile Number (<strong>{formatIndianMobile(submittedRecord.mobile || formData.mobile)}</strong>).
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
                occupation: '',
                mobile: '',
                alternateMobile: '',
                email: '',
                photoUrl: '',
                houseNo: '',
                street: '',
                pincode: '',
                idNumber: '',
                remarks: '',
              }));
            }}
          >
            Submit Another Application
          </button>
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

      {/* 1. MEMBER DETAILS */}
      <div className="form-section">
        <div className="form-section-title">
          <UserCheck size={18} />
          <span>1. Basic Details</span>
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
            <label className="form-label" htmlFor="bloodGroup">
              Blood Group (రక్త వర్గం) <span className="required-star">*</span>
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              className="form-control"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Blood Group --</option>
              {VALID_BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {errors.bloodGroup && <span className="form-error">{errors.bloodGroup}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="occupation">
              Occupation (వృత్తి) <span className="required-star">*</span>
            </label>
            <input
              id="occupation"
              name="occupation"
              type="text"
              className="form-control"
              placeholder="e.g. Agriculture, Business, Employee, Student"
              value={formData.occupation}
              onChange={handleChange}
              required
            />
            {errors.occupation && <span className="form-error">{errors.occupation}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mobile">
              Mobile Number (మొబైల్ నంబర్) <span className="required-star">*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--primary-dark)',
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border-color)',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  userSelect: 'none',
                }}
              >
                +91
              </span>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                maxLength={10}
                className="form-control"
                style={{ borderRadius: '0 6px 6px 0', flex: 1 }}
                placeholder="10-digit mobile number (for SMS ID & Password)"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
            {errors.mobile && <span className="form-error">{errors.mobile}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address (ఇమెయిల్) <span className="required-star">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="name@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="photoUpload">
              Member Passport Photo <span className="required-star">*</span>
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
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="idNumber">
              Aadhaar Number <span className="required-star">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
              <input
                id="idNumber"
                name="idNumber"
                type="text"
                className="form-control"
                placeholder="12-digit Aadhaar Number"
                value={formData.idNumber}
                onChange={handleChange}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
            {errors.idNumber && <span className="form-error">{errors.idNumber}</span>}
          </div>
        </div>
      </div>

      {/* 2. ADDRESS DETAILS */}
      <div className="form-section">
        <div className="form-section-title">
          <MapPin size={18} />
          <span>2. Address & Location</span>
        </div>

        <div className="form-grid">
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
            {fetchingPincode && <span className="form-hint" style={{ color: 'var(--primary)' }}>Fetching address details...</span>}
            {errors.pincode && <span className="form-error">{errors.pincode}</span>}
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
            Immediately approve member, generate permanent Membership ID &amp; Password, and send SMS to Mobile Number
          </label>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
          {isAdminMode
            ? (submitting ? 'Registering...' : 'Register Member')
            : 'Review & Submit Application'}
        </button>
      </div>

    </form>
  );
}
