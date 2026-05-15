/**
 * Pyonair WhatsApp - CORS & Security Middleware
 *
 * Provides Pyonair-specific CORS handling that supports wildcard subdomains
 * and adds security headers for production deployments.
 */

import { Request, Response, NextFunction } from 'express';

import { PYONAIR_CORS_CONFIG } from './pyonair.presets';

/**
 * Check if an origin matches a pattern (supports *.domain.com wildcards)
 */
function originMatchesPattern(origin: string, pattern: string): boolean {
  if (pattern === origin) return true;

  // Handle wildcard subdomain patterns like https://*.pyonair.com
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape regex special chars except *
      .replace(/\\\*/g, '[a-zA-Z0-9-]+'); // replace * with subdomain pattern
    return new RegExp(`^${regexPattern}$`).test(origin);
  }

  return false;
}

/**
 * Pyonair CORS middleware - restricts origins to Pyonair domains
 * Falls back to env CORS_ORIGIN if set (for development flexibility)
 */
export function pyonairCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const corsOriginEnv = process.env.CORS_ORIGIN;

  // If CORS_ORIGIN=* is set (development mode), allow all
  if (corsOriginEnv === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin) {
    // Check against Pyonair domain whitelist
    const allowed = PYONAIR_CORS_CONFIG.origins.some((pattern) => originMatchesPattern(origin, pattern));

    // Also check env-configured origins (comma-separated)
    const envOrigins = corsOriginEnv?.split(',').map((o) => o.trim()) || [];
    const envAllowed = envOrigins.some((pattern) => originMatchesPattern(origin, pattern));

    if (allowed || envAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  }

  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Methods', PYONAIR_CORS_CONFIG.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', PYONAIR_CORS_CONFIG.allowedHeaders.join(','));
  res.setHeader('Access-Control-Allow-Credentials', String(PYONAIR_CORS_CONFIG.credentials));
  res.setHeader('Access-Control-Max-Age', String(PYONAIR_CORS_CONFIG.maxAge));

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

/**
 * Security headers middleware for production deployments
 */
export function pyonairSecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove server header
  res.removeHeader('X-Powered-By');

  // Add Pyonair identifier
  res.setHeader('X-Pyonair-Service', 'whatsapp');

  next();
}
