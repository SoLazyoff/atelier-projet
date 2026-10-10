import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const haut = { id: 1, kind: 'piece', cat: 'top', top: 'hoodie', fabric: 'fleece', c: { tBody: '#ff0000' }, marks: [{ place: 'chest-l', text: 'A' }] };
const bas = { id: 2, kind: 'piece', cat: 'bottom', bottom: 'jogger', fabric: 'nylon', fabricB: 'nylon', c: { bLegs: '#00ff00' }, marks: [] };
const casquette = { id: 3, kind: 'piece', cat: 'acc', group: 'head', opt: 'cap', c: { aHead: '#0000ff' }, marks: [] };

test('mergePiece ne modifie pas la tenue de départ', () => {
  const t = charger();
  const G = { top: 'bomber', bottom: 'wide', fabric: 'leather', fabricB: 'leather', c: { tBody: '#111111' }, acc: { head: 'none' }, marks: [{ place: 'thigh-l' }] };
  const avant = JSON.stringify(G);
  const o = t.mergePiece(G, haut);
  assert.equal(JSON.stringify(G), avant);
  assert.equal(o.top, 'hoodie');
  assert.equal(o.c.tBody, '#ff0000');
  // le logo du bas est gardé, celui du haut remplace les anciens logos du haut
  assert.deepEqual(o.marks.map(m => m.place), ['thigh-l', 'chest-l']);
});

test('mergePiece applique bas et accessoire', () => {
  const t = charger();
  let o = t.mergePiece({ c: {}, acc: { head: 'none' }, marks: [] }, bas);
  assert.equal(o.bottom, 'jogger');
  assert.equal(o.fabricB, 'nylon');
  o = t.mergePiece(o, casquette);
  assert.equal(o.acc.head, 'cap');
  assert.equal(o.c.aHead, '#0000ff');
});

test('applyPiece garde son comportement sur S', () => {
  const t = charger();
  t.applyPiece(haut);
  assert.equal(t.S.top, 'hoodie');
  assert.equal(t.S.c.tBody, '#ff0000');
  assert.equal(t.S.mi, 0);
});
