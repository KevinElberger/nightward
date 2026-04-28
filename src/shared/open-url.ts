const URL_WITH_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;
const IPV4_HOSTNAME_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const DOMAIN_LABEL_PATTERN = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;

export function normalizeOpenUrl(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  const urlValue = URL_WITH_SCHEME_PATTERN.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(urlValue);

    if (!isOpenUrlProtocol(url.protocol) || !isOpenUrlHostname(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function isOpenUrlProtocol(protocol: string) {
  return protocol === 'http:' || protocol === 'https:';
}

function isOpenUrlHostname(hostname: string) {
  const normalizedHostname = hostname.trim().toLowerCase();

  // Local development URLs are useful when testing Nightward against a dev server.
  if (normalizedHostname === 'localhost') {
    return true;
  }

  if (isIpv4Hostname(normalizedHostname)) {
    return true;
  }

  if (normalizedHostname.startsWith('[') && normalizedHostname.endsWith(']')) {
    return normalizedHostname.includes(':');
  }

  return isDomainHostname(normalizedHostname);
}

function isIpv4Hostname(hostname: string) {
  if (!IPV4_HOSTNAME_PATTERN.test(hostname)) {
    return false;
  }

  // The regex checks the dotted shape; this rejects impossible octets like 999.
  return hostname.split('.').every((part) => Number(part) <= 255);
}

function isDomainHostname(hostname: string) {
  // Domain labels are the dot-separated pieces of a host:
  // "open.spotify.com" -> ["open", "spotify", "com"].
  const labels = hostname.split('.');
  // The TLD is the final label, like "com", "dev", or "co" in "example.co".
  const topLevelDomain = labels.at(-1) ?? '';

  // Requiring a non-numeric TLD catches accidental one-word entries like "spotify"
  // and single-label URLs like "https://example" without blocking normal domains.
  if (labels.length < 2 || topLevelDomain.length < 2 || /^\d+$/.test(topLevelDomain)) {
    return false;
  }

  // Each label can contain letters, numbers, and internal hyphens, but cannot
  // start or end with a hyphen.
  return labels.every((label) => DOMAIN_LABEL_PATTERN.test(label));
}

export function getOpenUrlDisplayName(value: string) {
  const normalizedUrl = normalizeOpenUrl(value) ?? value;

  try {
    const url = new URL(normalizedUrl);
    const hostname = url.hostname.replace(/^www\./i, '');

    return hostname === '' ? normalizedUrl : hostname;
  } catch {
    return value;
  }
}
