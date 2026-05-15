/**
 * Pyonair WhatsApp Integration Module
 *
 * Exports all Pyonair-specific functionality:
 * - Webhook presets for Chatwoot, N8N, CRM, Analytics
 * - Instance templates for common deployment scenarios
 * - CORS middleware with Pyonair domain whitelist
 * - Security headers for production
 * - API router for preset management
 */

export { pyonairRouter } from './pyonair.router';
export {
  PYONAIR_WEBHOOK_PRESETS,
  PYONAIR_INSTANCE_TEMPLATES,
  PYONAIR_CORS_CONFIG,
  generateInstanceName,
  validateInstanceName,
} from './pyonair.presets';
export type { WebhookPreset, InstanceTemplate } from './pyonair.presets';
export { pyonairCorsMiddleware, pyonairSecurityHeaders } from './pyonair.middleware';
