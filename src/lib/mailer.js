import nodemailer from 'nodemailer';
import { getDatabase, saveDatabase, recordAuditLog } from './database.js';

/**
 * Gmail Email Notification Service (`lib/mailer.js`)
 * --------------------------------------------------
 * Sends automated emails via Gmail SMTP when:
 * 1. A user submits a Membership Application
 * 2. An Administrator approves the application (sends Membership ID + 6-digit Password)
 */

export function getSmtpConfig() {
  const db = getDatabase();
  const smtpEmail =
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    db.settings?.smtpEmail ||
    'pushpagirisathwik@gmail.com';

  const smtpAppPassword =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    db.settings?.smtpAppPassword ||
    '';

  return {
    smtpEmail: String(smtpEmail).trim().replace(/^['"]|['"]$/g, ''),
    smtpAppPassword: String(smtpAppPassword).trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, ''),
    isConfigured: Boolean(smtpEmail && smtpAppPassword),
  };
}

export function saveSmtpConfig({ smtpEmail, smtpAppPassword, actor = 'admin' }) {
  const db = getDatabase();
  if (!db.settings) {
    db.settings = {};
  }
  if (smtpEmail !== undefined) {
    db.settings.smtpEmail = String(smtpEmail).trim();
  }
  if (smtpAppPassword !== undefined && String(smtpAppPassword).trim() !== '') {
    db.settings.smtpAppPassword = String(smtpAppPassword).replace(/\s+/g, '');
  }
  saveDatabase(db);

  recordAuditLog({
    action: 'SMTP_SETTINGS_UPDATED',
    entityType: 'System',
    entityId: 'smtp',
    actor,
    details: `Updated Gmail SMTP sender email to ${db.settings.smtpEmail}.`,
  });

  return getSmtpConfig();
}

function createTransporter() {
  const { smtpEmail, smtpAppPassword, isConfigured } = getSmtpConfig();
  if (!isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpEmail,
      pass: smtpAppPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends an email when a public user submits a new membership application.
 */
export async function sendApplicationSubmittedEmail(member) {
  if (!member?.email) {
    return { sent: false, reason: 'No recipient email address on application.' };
  }

  const { smtpEmail, isConfigured } = getSmtpConfig();
  if (!isConfigured) {
    console.warn(
      `[Mailer] Gmail App Password not configured. Skipping submission email to ${member.email} (App No: ${member.applicationNo}).`
    );
    return {
      sent: false,
      reason: 'Gmail App Password is not configured yet in .env.local or Admin Settings.',
    };
  }

  try {
    const transporter = createTransporter();
    const subject = `Mudiraj Community AP — Application Submitted (${member.applicationNo})`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #172554, #1e3a8a); color: #ffffff; padding: 20px 24px; border-bottom: 4px solid #d97706;">
          <h2 style="margin: 0; font-size: 20px;">Andhra Pradesh Mudiraj Mahasabha</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #fde68a;">Official Membership Application Confirmation</p>
        </div>
        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <p>Dear <strong>${member.fullName}</strong>,</p>
          <p>Thank you for submitting your membership application to the <strong>Andhra Pradesh Mudiraj Community Portal</strong>.</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;">
            <div style="font-size: 13px; color: #64748b;">Application Number</div>
            <div style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">${member.applicationNo}</div>
            <div style="font-size: 13px; color: #64748b;">Current Status</div>
            <div style="font-size: 14px; font-weight: 700; color: #b45309;">${member.status} (Pending Administrator Approval)</div>
          </div>
          <p style="font-size: 14px; color: #334155;">
            Once the Administrator reviews and approves your application, you will receive another email containing your permanent <strong>Membership ID</strong> and your <strong>6-digit Password</strong>.
          </p>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Regards,<br />
            <strong>State Head Office — Andhra Pradesh Mudiraj Mahasabha</strong>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mudiraj Community AP" <${smtpEmail}>`,
      to: member.email,
      subject,
      html,
    });

    recordAuditLog({
      action: 'EMAIL_SENT_APPLICATION',
      entityType: 'Member',
      entityId: member.id,
      actor: 'system',
      details: `Sent application confirmation email to ${member.email} (${member.applicationNo}).`,
    });

    return { sent: true };
  } catch (err) {
    console.error('[Mailer] Failed to send application email:', err);
    return { sent: false, reason: err.message };
  }
}

/**
 * Sends an email to the member with their generated Membership ID and 6-digit Password upon Admin approval.
 */
export async function sendMembershipApprovedEmail(member) {
  if (!member?.email) {
    return { sent: false, reason: 'Member does not have an email address on record.' };
  }

  const { smtpEmail, isConfigured } = getSmtpConfig();
  if (!isConfigured) {
    console.warn(
      `[Mailer] Gmail App Password not configured. Could not email credentials (ID: ${member.membershipId}, Password: ${member.memberPassword}) to ${member.email}.`
    );
    return {
      sent: false,
      reason: 'Gmail App Password is not configured yet in .env.local or Admin Settings.',
    };
  }

  try {
    const transporter = createTransporter();
    const subject = `Mudiraj Community AP — Membership Approved! Your ID & Password (${member.membershipId})`;
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #172554, #1e3a8a); color: #ffffff; padding: 20px 24px; border-bottom: 4px solid #15803d;">
          <h2 style="margin: 0; font-size: 20px;">Andhra Pradesh Mudiraj Mahasabha</h2>
          <p style="margin: 4px 0 0; font-size: 13px; color: #bbf7d0;">Membership Approved — Official Credentials</p>
        </div>
        <div style="padding: 24px; color: #0f172a; line-height: 1.6;">
          <p>Dear <strong>${member.fullName}</strong>,</p>
          <p>Congratulations! Your Mudiraj Community membership application (<strong>${member.applicationNo}</strong>) has been verified and <strong>Approved</strong> by the Administrator.</p>
          <p>Here are your official Membership Login / Verification credentials:</p>
          <div style="background: #eff6ff; border: 2px solid #1e3a8a; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <div style="margin-bottom: 14px;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Membership ID</div>
              <div style="font-size: 22px; font-weight: 800; color: #1e3a8a; font-family: monospace;">${member.membershipId}</div>
            </div>
            <div>
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 700;">Password (6 Digits)</div>
              <div style="font-size: 22px; font-weight: 800; color: #d97706; font-family: monospace; letter-spacing: 2px;">${member.memberPassword}</div>
            </div>
          </div>
          <p style="font-size: 13px; color: #475569;">
            Please keep this Membership ID and 6-digit password safe for accessing your membership profile and Digital ID Card.
          </p>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Regards,<br />
            <strong>State Head Office — Andhra Pradesh Mudiraj Mahasabha</strong>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Mudiraj Community AP" <${smtpEmail}>`,
      to: member.email,
      subject,
      html,
    });

    recordAuditLog({
      action: 'EMAIL_SENT_CREDENTIALS',
      entityType: 'Member',
      entityId: member.id,
      actor: 'admin',
      details: `Sent Membership ID (${member.membershipId}) and 6-digit password to ${member.email}.`,
    });

    return { sent: true };
  } catch (err) {
    console.error('[Mailer] Failed to send approval credentials email:', err);
    return { sent: false, reason: err.message };
  }
}
