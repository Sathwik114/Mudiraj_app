import { getDatabase, saveDatabase, recordAuditLog } from './database.js';
import { extractTenDigitMobile, formatIndianMobile } from './validation.js';

/**
 * SMS Text Message Notification Service (`lib/sms.js`)
 * ----------------------------------------------------
 * Sends automated SMS text messages to the member's +91 Mobile Number when:
 * 1. An Administrator approves a Pending Membership Application
 * 2. An Administrator directly registers a new Member
 *
 * Message includes:
 * - Permanent Membership ID (e.g. MUD-00000001)
 * - Generated Password (first 3 letters of last name + first 3 digits of mobile number)
 */

export function getSmsConfig() {
  const db = getDatabase();
  const settings = db.settings || {};

  const provider =
    process.env.SMS_PROVIDER ||
    settings.smsProvider ||
    (process.env.TWILIO_ACCOUNT_SID || settings.twilioAccountSid ? 'twilio' : 'fast2sms');

  const smsApiKey =
    process.env.FAST2SMS_API_KEY ||
    process.env.SMS_API_KEY ||
    process.env.TWOFACTOR_API_KEY ||
    process.env.TEXTBELT_API_KEY ||
    settings.smsApiKey ||
    '';

  const twilioAccountSid =
    process.env.TWILIO_ACCOUNT_SID ||
    settings.twilioAccountSid ||
    '';

  const twilioAuthToken =
    process.env.TWILIO_AUTH_TOKEN ||
    settings.twilioAuthToken ||
    '';

  const twilioPhoneNumber =
    process.env.TWILIO_PHONE_NUMBER ||
    settings.twilioPhoneNumber ||
    '';

  const isTwilioConfigured = Boolean(
    String(twilioAccountSid).trim() &&
      String(twilioAuthToken).trim() &&
      String(twilioPhoneNumber).trim()
  );
  const isApiKeyConfigured = Boolean(smsApiKey && String(smsApiKey).trim());

  const isConfigured =
    provider === 'twilio'
      ? isTwilioConfigured
      : isApiKeyConfigured || isTwilioConfigured;

  return {
    provider: String(provider).trim(),
    smsApiKey: String(smsApiKey).trim(),
    twilioAccountSid: String(twilioAccountSid).trim(),
    twilioAuthToken: String(twilioAuthToken).trim(),
    twilioPhoneNumber: String(twilioPhoneNumber).trim(),
    isConfigured,
  };
}

export function saveSmsConfig({
  provider,
  smsApiKey,
  twilioAccountSid,
  twilioAuthToken,
  twilioPhoneNumber,
  actor = 'admin',
}) {
  const db = getDatabase();
  if (!db.settings) {
    db.settings = {};
  }
  if (provider !== undefined) {
    db.settings.smsProvider = String(provider).trim();
  }
  if (smsApiKey !== undefined && String(smsApiKey).trim() !== '') {
    db.settings.smsApiKey = String(smsApiKey).trim();
  }
  if (twilioAccountSid !== undefined) {
    db.settings.twilioAccountSid = String(twilioAccountSid).trim();
  }
  if (twilioAuthToken !== undefined && String(twilioAuthToken).trim() !== '') {
    db.settings.twilioAuthToken = String(twilioAuthToken).trim();
  }
  if (twilioPhoneNumber !== undefined) {
    db.settings.twilioPhoneNumber = String(twilioPhoneNumber).trim();
  }
  saveDatabase(db);

  recordAuditLog({
    action: 'SMS_SETTINGS_UPDATED',
    entityType: 'System',
    entityId: 'sms',
    actor,
    details: `Updated SMS Gateway configuration (Provider: ${db.settings.smsProvider || 'fast2sms'}).`,
  });

  return getSmsConfig();
}

/**
 * Dispatches an SMS text message to an Indian +91 mobile number via the configured SMS provider.
 */
async function dispatchSmsViaGateway({ tenDigitMobile, e164Mobile, smsText, config }) {
  const {
    provider,
    smsApiKey,
    twilioAccountSid,
    twilioAuthToken,
    twilioPhoneNumber,
    isConfigured,
  } = config;

  if (!isConfigured) {
    return {
      gatewayDelivered: false,
      gatewayReason:
        'SMS Gateway API credentials are not configured in Admin Settings (/admin/settings).',
    };
  }

  try {
    // 1. Twilio SMS Gateway (Uses E.164 format +91XXXXXXXXXX)
    if (provider === 'twilio' || (twilioAccountSid && twilioAuthToken && twilioPhoneNumber)) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
        twilioAccountSid
      )}/Messages.json`;
      const authHeader = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
      const formParams = new URLSearchParams();
      formParams.append('To', e164Mobile); // +917285972050
      formParams.append('From', twilioPhoneNumber);
      formParams.append('Body', smsText);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });
      const result = await response.json();
      if (response.ok && (result.sid || result.status)) {
        return { gatewayDelivered: true, gatewayReason: null, providerUsed: 'Twilio (+91)' };
      }
      return {
        gatewayDelivered: false,
        gatewayReason: result.message || `Twilio error (${response.status})`,
      };
    }

    // 2. 2Factor.in India Gateway
    if (provider === '2factor') {
      const url = `https://2factor.in/API/V1/${encodeURIComponent(
        smsApiKey
      )}/SMS/${encodeURIComponent(e164Mobile)}/${encodeURIComponent(
        smsText
      )}`;
      const response = await fetch(url, { method: 'GET' });
      const result = await response.json();
      if (response.ok && result.Status === 'Success') {
        return { gatewayDelivered: true, gatewayReason: null, providerUsed: '2Factor (+91)' };
      }
      return {
        gatewayDelivered: false,
        gatewayReason: result.Details || '2Factor SMS gateway rejected request.',
      };
    }

    // 3. Textbelt International SMS Gateway (Uses +91XXXXXXXXXX)
    if (provider === 'textbelt') {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: e164Mobile,
          message: smsText,
          key: smsApiKey,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        return { gatewayDelivered: true, gatewayReason: null, providerUsed: 'Textbelt (+91)' };
      }
      return {
        gatewayDelivered: false,
        gatewayReason: result.error || 'Textbelt SMS gateway rejected request.',
      };
    }

    // 4. Fast2SMS India Gateway (Default for Indian +91 numbers)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: smsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: smsText,
        language: 'english',
        flash: 0,
        numbers: tenDigitMobile,
      }),
    });
    const result = await response.json();
    if (response.ok && result.return) {
      return { gatewayDelivered: true, gatewayReason: null, providerUsed: 'Fast2SMS (+91)' };
    }
    return {
      gatewayDelivered: false,
      gatewayReason: Array.isArray(result.message)
        ? result.message.join(', ')
        : result.message || 'Fast2SMS gateway rejected request.',
    };
  } catch (err) {
    console.error('[SMS] Failed to send via SMS gateway:', err);
    return {
      gatewayDelivered: false,
      gatewayReason: err.message || 'Network error contacting SMS gateway.',
    };
  }
}

/**
 * Sends an SMS to the member's Indian +91 mobile number with their Membership ID and Password.
 */
export async function sendMembershipCredentialsSms(
  member,
  { actor = 'admin', trigger = 'APPROVAL' } = {}
) {
  if (!member?.mobile) {
    return {
      sent: false,
      gatewayDelivered: false,
      reason: 'Member does not have a mobile number on record.',
    };
  }

  const tenDigitMobile = extractTenDigitMobile(member.mobile);
  if (!/^[6-9]\d{9}$/.test(tenDigitMobile)) {
    return {
      sent: false,
      gatewayDelivered: false,
      reason: `Invalid 10-digit Indian mobile number: ${member.mobile}`,
    };
  }

  const e164Mobile = formatIndianMobile(tenDigitMobile); // +917285972050
  const password = member.memberPassword || member.password || '';
  const smsText = `AP Mudiraj Community: Dear ${member.fullName}, your membership is Approved! Membership ID: ${member.membershipId}, Password: ${password}.`;

  const config = getSmsConfig();
  const { gatewayDelivered, gatewayReason } = await dispatchSmsViaGateway({
    tenDigitMobile,
    e164Mobile,
    smsText,
    config,
  });

  if (!gatewayDelivered) {
    console.log(`[SMS Dispatch Pending/Fallback -> ${e164Mobile}] ${smsText} (${gatewayReason})`);
  } else {
    console.log(`[SMS Delivered -> ${e164Mobile}] ${smsText}`);
  }

  const smsUri = `sms:${e164Mobile}?body=${encodeURIComponent(smsText)}`;
  const whatsappUri = `https://wa.me/91${tenDigitMobile}?text=${encodeURIComponent(smsText)}`;

  const db = getDatabase();
  if (!Array.isArray(db.smsLogs)) {
    db.smsLogs = [];
  }
  db.smsLogs.unshift({
    id: `sms-${Date.now()}`,
    memberId: member.id,
    mobile: e164Mobile,
    membershipId: member.membershipId,
    password,
    message: smsText,
    trigger,
    status: gatewayDelivered ? 'DELIVERED' : 'GATEWAY_NOT_CONFIGURED_OR_FAILED',
    reason: gatewayReason || null,
    createdAt: new Date().toISOString(),
  });
  if (db.smsLogs.length > 1000) {
    db.smsLogs = db.smsLogs.slice(0, 1000);
  }
  saveDatabase(db);

  recordAuditLog({
    action: gatewayDelivered ? 'SMS_DELIVERED_CREDENTIALS' : 'SMS_GENERATED_CREDENTIALS',
    entityType: 'Member',
    entityId: member.id,
    actor,
    details: gatewayDelivered
      ? `SMS delivered to ${e164Mobile} (${trigger}): Membership ID ${member.membershipId}, Password ${password}.`
      : `Credentials generated for ${e164Mobile} (${trigger}): Membership ID ${member.membershipId}, Password ${password}. Direct SMS/WhatsApp link ready (${gatewayReason}).`,
  });

  return {
    sent: gatewayDelivered,
    gatewayDelivered,
    gatewayReason,
    mobile: e164Mobile,
    tenDigitMobile,
    messageText: smsText,
    smsUri,
    whatsappUri,
  };
}
