// Content Security Policy middleware for Clerk compatibility

export const getCSPDirectives = (isDevelopment = false) => {
  const baseDirectives = {
    defaultSrc: ["'self'", 'https:'],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Clerk
      "'unsafe-eval'", // Required for Clerk
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
      'https://challenges.cloudflare.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for Clerk styling
      'https://fonts.googleapis.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://*.clerk.com',
      'https://*.clerk.accounts.dev',
      'https://img.clerk.com',
    ],
    connectSrc: [
      "'self'",
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
      'https://api.clerk.com',
      'https://clerk.accounts.dev',
    ],
    frameSrc: [
      'https://challenges.cloudflare.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.com',
    ],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'https://*.clerk.accounts.dev', 'https://*.clerk.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
  };

  // Add development-specific directives
  if (isDevelopment) {
    baseDirectives.scriptSrc.push('http://localhost:*', 'ws://localhost:*');
    baseDirectives.connectSrc.push('http://localhost:*', 'ws://localhost:*');
    baseDirectives.styleSrc.push('http://localhost:*');
  }

  return baseDirectives;
};

export const createCSPMiddleware = (isDevelopment = false) => {
  return (req, res, next) => {
    const directives = getCSPDirectives(isDevelopment);

    // Convert directives to CSP string
    const cspString = Object.entries(directives)
      .map(([key, values]) => {
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${directive} ${values.join(' ')}`;
      })
      .join('; ');

    res.setHeader('Content-Security-Policy', cspString);
    next();
  };
};
