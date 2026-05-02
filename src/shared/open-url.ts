const URL_WITH_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;
const IPV4_HOSTNAME_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const DOMAIN_LABEL_PATTERN = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;
const SPOTIFY_URI_PATTERN = /^spotify:([a-z]+):([a-z\d]{22})$/i;
const SPOTIFY_RESOURCE_LABELS = new Map([
  ['album', 'album'],
  ['artist', 'artist'],
  ['episode', 'episode'],
  ['playlist', 'playlist'],
  ['show', 'show'],
  ['track', 'track']
]);

export function normalizeOpenUrl(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  const spotifyUri = normalizeSpotifyUri(trimmedValue);

  if (spotifyUri !== null) {
    return spotifyUri;
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
  const spotifyDisplayName = getSpotifyUriDisplayName(normalizedUrl);

  if (spotifyDisplayName !== null) {
    return spotifyDisplayName;
  }

  try {
    const url = new URL(normalizedUrl);
    const hostname = url.hostname.replace(/^www\./i, '');

    return hostname === '' ? normalizedUrl : hostname;
  } catch {
    return value;
  }
}

function normalizeSpotifyUri(value: string) {
  const spotifyUri = parseSpotifyUri(value);

  if (spotifyUri === null) {
    return null;
  }

  return `spotify:${spotifyUri.resourceType}:${spotifyUri.id}`;
}

function getSpotifyUriDisplayName(value: string) {
  const spotifyUri = parseSpotifyUri(value);

  if (spotifyUri === null) {
    return null;
  }

  return `Spotify ${SPOTIFY_RESOURCE_LABELS.get(spotifyUri.resourceType) ?? 'link'}`;
}

function parseSpotifyUri(value: string) {
  const match = SPOTIFY_URI_PATTERN.exec(value);

  if (match === null) {
    return null;
  }

  // Spotify URIs identify app-native resources:
  // "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M" -> resource "playlist".
  const resourceType = match[1].toLowerCase();

  if (!SPOTIFY_RESOURCE_LABELS.has(resourceType)) {
    return null;
  }

  return {
    id: match[2],
    resourceType
  };
}
