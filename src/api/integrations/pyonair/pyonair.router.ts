/**
 * Pyonair WhatsApp - Presets & Templates API Router
 *
 * Exposes endpoints for fetching webhook presets, instance templates,
 * and applying them to new or existing instances.
 */

import { Router, Request, Response } from 'express';

import {
  PYONAIR_WEBHOOK_PRESETS,
  PYONAIR_INSTANCE_TEMPLATES,
  PYONAIR_CORS_CONFIG,
  generateInstanceName,
  validateInstanceName,
} from './pyonair.presets';

const router = Router();

/**
 * GET /pyonair/presets/webhooks
 * List all available webhook presets
 */
router.get('/presets/webhooks', (_req: Request, res: Response) => {
  const presets = Object.entries(PYONAIR_WEBHOOK_PRESETS).map(([key, preset]) => ({
    id: key,
    ...preset,
  }));
  res.json({ presets });
});

/**
 * GET /pyonair/presets/webhooks/:id
 * Get a specific webhook preset
 */
router.get('/presets/webhooks/:id', (req: Request, res: Response) => {
  const preset = PYONAIR_WEBHOOK_PRESETS[req.params.id];
  if (!preset) {
    return res.status(404).json({ error: 'Preset not found', available: Object.keys(PYONAIR_WEBHOOK_PRESETS) });
  }
  res.json({ id: req.params.id, ...preset });
});

/**
 * GET /pyonair/presets/templates
 * List all available instance templates
 */
router.get('/presets/templates', (_req: Request, res: Response) => {
  const templates = Object.entries(PYONAIR_INSTANCE_TEMPLATES).map(([key, template]) => ({
    id: key,
    ...template,
  }));
  res.json({ templates });
});

/**
 * GET /pyonair/presets/templates/:id
 * Get a specific instance template
 */
router.get('/presets/templates/:id', (req: Request, res: Response) => {
  const template = PYONAIR_INSTANCE_TEMPLATES[req.params.id];
  if (!template) {
    return res.status(404).json({ error: 'Template not found', available: Object.keys(PYONAIR_INSTANCE_TEMPLATES) });
  }
  res.json({ id: req.params.id, ...template });
});

/**
 * GET /pyonair/cors
 * Get the Pyonair CORS configuration (for reference/debugging)
 */
router.get('/cors', (_req: Request, res: Response) => {
  res.json({ cors: PYONAIR_CORS_CONFIG });
});

/**
 * POST /pyonair/instance-name/generate
 * Generate a valid instance name following Pyonair conventions
 * Body: { clientSlug: string, purpose: string, number?: number }
 */
router.post('/instance-name/generate', (req: Request, res: Response) => {
  const { clientSlug, purpose, number } = req.body;
  if (!clientSlug || !purpose) {
    return res.status(400).json({ error: 'clientSlug and purpose are required' });
  }
  const name = generateInstanceName(clientSlug, purpose, number);
  const validation = validateInstanceName(name);
  res.json({ name, ...validation });
});

/**
 * POST /pyonair/instance-name/validate
 * Validate an instance name against Pyonair conventions
 * Body: { name: string }
 */
router.post('/instance-name/validate', (req: Request, res: Response) => {
  const { name } = req.body;
  const result = validateInstanceName(name);
  res.json(result);
});

/**
 * GET /pyonair/health
 * Pyonair-specific health check with branding
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Pyonair WhatsApp',
    version: process.env.npm_package_version || '2.0.0',
    timestamp: new Date().toISOString(),
    features: {
      multiInstance: true,
      chatwootIntegration: process.env.CHATWOOT_ENABLED === 'true',
      n8nIntegration: process.env.N8N_ENABLED === 'true',
      webhookPresets: Object.keys(PYONAIR_WEBHOOK_PRESETS).length,
      instanceTemplates: Object.keys(PYONAIR_INSTANCE_TEMPLATES).length,
    },
  });
});

export { router as pyonairRouter };
