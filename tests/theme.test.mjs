import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

test('le thème est automatique par défaut et pour une valeur inconnue', () => {
  assert.equal(charger().S.theme, 'auto');
  assert.equal(charger({ 'atelier-marque-v1': JSON.stringify({ theme: 'violet' }) }).S.theme, 'auto');
  assert.equal(charger({ 'atelier-marque-v1': JSON.stringify({ theme: 'dark' }) }).S.theme, 'dark');
});

test('le bouton fait le tour auto → clair → sombre → auto', () => {
  const t = charger();
  let k = 'auto';
  const tour = [k];
  for (let i = 0; i < 3; i++) { k = t.THEME_NEXT[k]; tour.push(k); }
  assert.equal(tour.join(), 'auto,light,dark,auto');
});

test('un thème forcé pose data-theme, le mode auto le retire', () => {
  const t = charger({ 'atelier-marque-v1': JSON.stringify({ theme: 'dark' }) });
  const root = t.doc.documentElement;
  assert.equal(root.attrs['data-theme'], 'dark');
  t.S.theme = 'auto'; t.applyTheme();
  assert.equal('data-theme' in root.attrs, false);
});
