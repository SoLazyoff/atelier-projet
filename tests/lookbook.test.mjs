import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

// pièces fabriquées par makePiece() pour avoir exactement la forme des vraies sauvegardes
function piece(id, reglage) {
  const t = charger();
  reglage(t.S);
  return Object.assign(JSON.parse(JSON.stringify(t.makePiece())), { id });
}
const haut = piece(1, S => { S.cat = 'top'; S.top = 'hoodie'; S.fabric = 'fleece'; S.c.tBody = '#ff0000'; S.marks = [{ place: 'chest-l', text: 'A' }]; });
const bas = piece(2, S => { S.cat = 'bottom'; S.bottom = 'cargo'; S.fabricB = 'nylon'; S.c.bLegs = '#00ff00'; });
const casquette = piece(3, S => { S.cat = 'acc'; S.accGroup = 'head'; S.acc.head = 'cap'; S.c.aHead = '#0000ff'; });

test('mergePiece ne modifie pas la tenue de départ', () => {
  const t = charger();
  const G = { top: 'bomber', bottom: 'wide', fabric: 'leather', fabricB: 'leather', c: { tBody: '#111111' }, acc: { head: 'none' }, marks: [{ place: 'thigh-l' }] };
  const avant = JSON.stringify(G);
  const o = t.mergePiece(G, haut);
  assert.equal(JSON.stringify(G), avant);
  assert.equal(o.top, 'hoodie');
  assert.equal(o.c.tBody, '#ff0000');
  // le logo du bas est gardé, celui du haut remplace les anciens logos du haut
  assert.equal(o.marks.map(m => m.place).join(), 'thigh-l,chest-l');
});

test('mergePiece applique bas et accessoire', () => {
  const t = charger();
  let o = t.mergePiece({ c: {}, acc: { head: 'none' }, marks: [] }, bas);
  assert.equal(o.bottom, 'cargo');
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

test('load() donne un Lookbook vide aux anciennes sauvegardes', () => {
  const ancienne = JSON.stringify({ looks: [haut], brand: { name: 'X' } });
  const t = charger({ 'atelier-marque-v1': ancienne });
  assert.equal(JSON.stringify(t.S.lookbook), '[]');
  assert.equal(t.S.lb.top, null);
  assert.equal(JSON.stringify(t.S.lb.acc), '{}');
  assert.equal(t.S.looks.length, 1);
});

function avecLookbook(lookbook) {
  return charger({ 'atelier-marque-v1': JSON.stringify({ looks: [haut, bas, casquette], lookbook }) });
}

test('lookG assemble les pièces référencées', () => {
  const t = avecLookbook([]);
  const G = t.lookG({ top: 1, bottom: 2, acc: { head: 3 } }, 'back');
  assert.equal(G.top, 'hoodie');
  assert.equal(G.bottom, 'cargo');
  assert.equal(G.acc.head, 'cap');
  assert.equal(G.c.tBody, '#ff0000');
  assert.equal(G.view, 'back');
  assert.equal(G.miss.length, 0);
  assert.match(t.build(G, 'x', null), /^<svg/);
});

test('lookG suit les modifications de la pièce', () => {
  const t = avecLookbook([]);
  t.S.looks[0].c.tBody = '#123456';
  assert.equal(t.lookG({ top: 1, bottom: 2, acc: {} }).c.tBody, '#123456');
});

test('une pièce retirée ne casse pas le look', () => {
  const t = avecLookbook([]);
  const l = { name: 'L', top: 99, bottom: 2, acc: { head: 98 } };
  const G = t.lookG(l);
  assert.equal(G.miss.join(), 'top,head');
  assert.match(t.build(G, 'x', null), /^<svg/);
  assert.match(t.lbText(l), /pièce retirée/);
});

test('lbUses compte les looks qui utilisent une pièce', () => {
  const t = avecLookbook([{ id: 10, top: 1, bottom: 2, acc: {} }, { id: 11, top: 1, bottom: 2, acc: { head: 3 } }]);
  assert.equal(t.lbUses(1), 2);
  assert.equal(t.lbUses(3), 1);
  assert.equal(t.lbUses(42), 0);
});
