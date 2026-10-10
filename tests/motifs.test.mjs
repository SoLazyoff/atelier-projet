import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

function piece(id, reglage) {
  const t = charger();
  reglage(t.S);
  return Object.assign(JSON.parse(JSON.stringify(t.makePiece())), { id });
}

test('une ancienne sauvegarde se charge sans motif', () => {
  const t = charger({ 'atelier-marque-v1': JSON.stringify({ c: { tBody: '#111111' }, looks: [] }) });
  assert.equal(JSON.stringify(t.S.pat), '{"top":"none","bottom":"none"}');
  assert.ok(t.S.c.tPat && t.S.c.bPat);
});

test('le motif est dessiné seulement quand il est choisi', () => {
  const t = charger();
  assert.doesNotMatch(t.build(t.S, 'u', null), /id="pattu"/);
  t.S.pat.top = 'stripe';
  const svg = t.build(t.S, 'u', null);
  assert.match(svg, /<pattern id="pattu"/);
  assert.match(svg, /fill="url\(#pattu\)"/);
  assert.doesNotMatch(svg, /url\(#patbu\)/);
  for (const k of ['check', 'camo', 'grad']) {
    t.S.pat.bottom = k;
    assert.match(t.build(t.S, 'u', null), /id="patbu"/, k);
  }
});

test('la couleur du motif devient une zone seulement si un motif est actif', () => {
  const t = charger();
  t.S.mode = 'piece'; t.S.cat = 'top';
  assert.equal('tPat' in t.zonesOf(t.S), false);
  t.S.pat.top = 'camo';
  assert.equal(t.zonesOf(t.S).tPat, 'Motif');
  t.S.mode = 'outfit';
  assert.equal(t.zonesOf(t.S).tPat, 'Motif du haut');
  assert.equal('bPat' in t.zonesOf(t.S), false);
});

test('le motif voyage avec la pièce, jusque dans le Lookbook', () => {
  const haut = piece(1, S => { S.cat = 'top'; S.pat.top = 'stripe'; S.c.tPat = '#c8283c'; });
  const bas = piece(2, S => { S.cat = 'bottom'; S.pat.bottom = 'grad'; });
  assert.equal(haut.pat, 'stripe');
  assert.equal(haut.c.tPat, '#c8283c');
  assert.match(t0().pieceThumb(haut, 'p'), /<pattern id="pattp"/);
  const t = charger({ 'atelier-marque-v1': JSON.stringify({ looks: [haut, bas] }) });
  const G = t.lookG({ top: 1, bottom: 2, acc: {} });
  assert.equal(G.pat.top, 'stripe');
  assert.equal(G.pat.bottom, 'grad');
  t.applyPiece(haut);
  assert.equal(t.S.pat.top, 'stripe');
});

test('une ancienne pièce sans motif reste unie', () => {
  const t = charger();
  const o = t.mergePiece({ c: {}, acc: {}, marks: [], pat: { top: 'camo', bottom: 'none' } }, { cat: 'top', top: 'hoodie', fabric: 'fleece', c: {} });
  assert.equal(o.pat.top, 'none');
});

test('un look aléatoire garde des couleurs de motif valides', () => {
  const t = charger();
  t.randomLook();
  assert.match(t.S.c.tPat, /^#/);
  assert.match(t.S.c.bPat, /^#/);
});

function t0() { return charger(); }
