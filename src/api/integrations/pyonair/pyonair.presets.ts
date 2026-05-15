/**
 * Pyonair WhatsApp - Webhook Presets & Instance Templates
 *
 * Pre-configured webhook and instance settings for common Pyonair integrations.
 * These presets allow one-click setup of WhatsApp instances connected to
 * Pyonair Support (Chatwoot), Pyonair Automations (N8N), and custom CRM webhooks.
 */

export interface WebhookPreset {
  name: string;
  description: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  byEvents: boolean;
  base64: boolean;
}

export interface InstanceTemplate {
  name: string;
  description: string;
  webhook: WebhookPreset;
  settings: {
    rejectCall: boolean;
    msgCall: string;
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
    syncFullHistory: boolean;
  };
}

/**
 * Webhook presets for common Pyonair integrations
 */
export const PYONAIR_WEBHOOK_PRESETS: Record<string, WebhookPreset> = {
  // Pyonair Support (Chatwoot) - Full customer support integration
  'pyonair-support': {
    name: 'Pyonair Support (Chatwoot)',
    description: 'Connect WhatsApp to Pyonair Support for unified customer inbox',
    url: '${CHATWOOT_URL:-http://chatwoot:3000}/webhooks/whatsapp',
    events: [
      'MESSAGES_UPSERT',
      'MESSAGES_UPDATE',
      'MESSAGES_DELETE',
      'MESSAGES_EDITED',
      'SEND_MESSAGE',
      'CONTACTS_UPSERT',
      'CONNECTION_UPDATE',
      'PRESENCE_UPDATE',
    ],
    byEvents: false,
    base64: true,
  },

  // Pyonair Automations (N8N) - Workflow automation triggers
  'pyonair-automations': {
    name: 'Pyonair Automations (N8N)',
    description: 'Trigger automated workflows from WhatsApp messages',
    url: '${N8N_URL:-http://n8n:5678}/webhook/whatsapp',
    events: [
      'MESSAGES_UPSERT',
      'SEND_MESSAGE',
      'CONNECTION_UPDATE',
      'QRCODE_UPDATED',
    ],
    headers: {
      'X-Pyonair-Source': 'whatsapp',
      'X-Pyonair-Version': '1.0',
    },
    byEvents: true,
    base64: false,
  },

  // Pyonair CRM - Lead capture from WhatsApp
  'pyonair-crm': {
    name: 'Pyonair CRM Integration',
    description: 'Capture leads and conversations directly into Pyonair CRM',
    url: '${CRM_WEBHOOK_URL:-http://localhost:4000}/api/webhooks/whatsapp',
    events: [
      'MESSAGES_UPSERT',
      'CONTACTS_UPSERT',
      'CONTACTS_UPDATE',
      'SEND_MESSAGE',
    ],
    headers: {
      'X-Pyonair-Source': 'whatsapp',
      'Content-Type': 'application/json',
    },
    byEvents: false,
    base64: false,
  },

  // Pyonair Analytics - Message tracking & reporting
  'pyonair-analytics': {
    name: 'Pyonair Analytics',
    description: 'Track message volume, response times, and engagement',
    url: '${ANALYTICS_WEBHOOK_URL:-http://localhost:4001}/api/events/whatsapp',
    events: [
      'MESSAGES_UPSERT',
      'SEND_MESSAGE',
      'SEND_MESSAGE_UPDATE',
      'CONNECTION_UPDATE',
      'CALL',
    ],
    headers: {
      'X-Pyonair-Source': 'whatsapp',
    },
    byEvents: true,
    base64: false,
  },

  // Custom client webhook - Template for client-specific integrations
  'custom': {
    name: 'Custom Webhook',
    description: 'Configure a custom webhook URL for client-specific integrations',
    url: '',
    events: [
      'MESSAGES_UPSERT',
      'SEND_MESSAGE',
      'CONNECTION_UPDATE',
    ],
    byEvents: false,
    base64: false,
  },
};

/**
 * Instance templates for common client deployment scenarios
 */
export const PYONAIR_INSTANCE_TEMPLATES: Record<string, InstanceTemplate> = {
  // Customer Support Agent - Connected to Chatwoot
  'support-agent': {
    name: 'Customer Support',
    description: 'WhatsApp number for customer support, connected to Pyonair Support inbox',
    webhook: PYONAIR_WEBHOOK_PRESETS['pyonair-support'],
    settings: {
      rejectCall: false,
      msgCall: 'Sorry, we cannot take calls on this number. Please send a message and our team will respond shortly.',
      groupsIgnore: true,
      alwaysOnline: true,
      readMessages: true,
      readStatus: false,
      syncFullHistory: false,
    },
  },

  // Sales Agent - Connected to CRM
  'sales-agent': {
    name: 'Sales & Outreach',
    description: 'WhatsApp number for sales team, leads flow to Pyonair CRM',
    webhook: PYONAIR_WEBHOOK_PRESETS['pyonair-crm'],
    settings: {
      rejectCall: false,
      msgCall: '',
      groupsIgnore: false,
      alwaysOnline: true,
      readMessages: true,
      readStatus: true,
      syncFullHistory: true,
    },
  },

  // Notification Bot - Automated messages only
  'notification-bot': {
    name: 'Notification Bot',
    description: 'Automated notification sender (appointments, reminders, confirmations)',
    webhook: PYONAIR_WEBHOOK_PRESETS['pyonair-automations'],
    settings: {
      rejectCall: true,
      msgCall: 'This is an automated number. Please contact us at your main support channel.',
      groupsIgnore: true,
      alwaysOnline: false,
      readMessages: false,
      readStatus: false,
      syncFullHistory: false,
    },
  },
};

/**
 * CORS configuration for Pyonair domains
 */
export const PYONAIR_CORS_CONFIG = {
  origins: [
    'https://pyonair.com',
    'https://*.pyonair.com',
    'https://app.pyonair.com',
    'https://admin.pyonair.com',
    'https://support.pyonair.com',
    'https://wa.pyonair.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Pyonair-Source',
    'X-Pyonair-Version',
    'X-Pyonair-Instance',
    'apikey',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Default multi-instance naming convention for Pyonair clients
 * Format: {client_slug}_{purpose}_{number}
 * Example: acme_support_1, acme_sales_1
 */
export function generateInstanceName(clientSlug: string, purpose: string, number = 1): string {
  const sanitized = clientSlug.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${sanitized}_${purpose}_${number}`;
}

/**
 * Validate instance name follows Pyonair conventions
 */
export function validateInstanceName(name: string): { valid: boolean; reason?: string } {
  if (!name) return { valid: false, reason: 'Instance name is required' };
  if (name.length > 50) return { valid: false, reason: 'Instance name must be 50 characters or less' };
  if (!/^[a-z0-9_]+$/.test(name)) return { valid: false, reason: 'Instance name must be lowercase alphanumeric with underscores only' };
  if (!name.includes('_')) return { valid: false, reason: 'Instance name must follow format: clientslug_purpose_number' };
  return { valid: true };
}
