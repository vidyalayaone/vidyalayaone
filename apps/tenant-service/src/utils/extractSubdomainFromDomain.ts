export function extractSubdomainFromDomain(domain: string): string | null {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '');
  
  // Check if it's a vidyalayaone.com subdomain
  const match = domain.match(/^([a-z0-9-]+)\.vidyalayaone\.com$/);
  if (match) {
    return match[1];
  }
  
  return null;
}
