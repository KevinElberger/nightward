import { describe, expect, it } from 'vitest';
import { getOpenUrlDisplayName, normalizeOpenUrl } from './open-url';

describe('open-url utilities', () => {
  it('normalizes explicit http and https URLs', () => {
    expect(normalizeOpenUrl(' https://open.spotify.com/playlist/focus ')).toBe(
      'https://open.spotify.com/playlist/focus'
    );
    expect(normalizeOpenUrl('http://example.com')).toBe('http://example.com/');
  });

  it('adds https to bare domain URLs', () => {
    expect(normalizeOpenUrl('open.spotify.com/playlist/focus')).toBe(
      'https://open.spotify.com/playlist/focus'
    );
  });

  it('accepts Spotify resource URIs', () => {
    expect(normalizeOpenUrl(' spotify:playlist:37i9dQZF1DXcBWIGoYBM5M ')).toBe(
      'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M'
    );
    expect(normalizeOpenUrl('Spotify:Track:6rqhFgbbKwnb9MLmUQDhG6')).toBe(
      'spotify:track:6rqhFgbbKwnb9MLmUQDhG6'
    );
  });

  it('accepts localhost and IP hosts', () => {
    expect(normalizeOpenUrl('localhost:5173')).toBe('https://localhost:5173/');
    expect(normalizeOpenUrl('127.0.0.1:5173')).toBe('https://127.0.0.1:5173/');
  });

  it('rejects unsupported protocols and implausible hosts', () => {
    expect(normalizeOpenUrl('spotify')).toBeNull();
    expect(normalizeOpenUrl('spotify:playlist:focus')).toBeNull();
    expect(normalizeOpenUrl('spotify:local:artist:album:title:180')).toBeNull();
    expect(normalizeOpenUrl('https://spotify')).toBeNull();
    expect(normalizeOpenUrl('file:///Users/kevin/focus.html')).toBeNull();
    expect(normalizeOpenUrl('https://example')).toBeNull();
    expect(normalizeOpenUrl('https://example.c')).toBeNull();
    expect(normalizeOpenUrl('https://999.0.0.1')).toBeNull();
  });

  it('gets a compact display name from valid URLs', () => {
    expect(getOpenUrlDisplayName('https://www.youtube.com/playlist?list=focus')).toBe(
      'youtube.com'
    );
    expect(getOpenUrlDisplayName('spotify:playlist:37i9dQZF1DXcBWIGoYBM5M')).toBe(
      'Spotify playlist'
    );
  });
});
