import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const t = charger();
const avec = (dets, extra) => Object.assign({}, t.S, { dets: dets.map(d => Object.assign({}, t.DEFDET, d)) }, extra || {});

test('chaque détail a une famille, un nom et un emplacement connu', () => {
  for (const [k, d] of Object.entries(t.DET)) {
    assert.ok(['pocket', 'label', 'zip', 'cord', 'hood'].includes(d.c), k);
    assert.ok(d.l, k);
    assert.ok(d.place in t.DPL || ['chest-l', 'chest-r', 'chest-c', 'thigh-l', 'pocket-l', 'sleeve-r'].includes(d.place), k);
  }
});

test('chaque détail se dessine sur le mannequin et dans les trois styles à plat, sans valeur invalide', () => {
  for (const [k, d] of Object.entries(t.DET)) {
    const G = avec([{ kind: k, place: d.place }], { mode: 'outfit', top: 'bomber', bottom: 'cargo' });
    const vues = ['front', 'back'].map(view => t.build(Object.assign({}, G, { view }), 'd', null)).join('');
    assert.doesNotMatch(vues, /NaN|undefined|Infinity/, k);
    const cat = ['thigh-l', 'pocket-l', 'waist-b', 'waist-f'].includes(d.place) ? 'bottom' : 'top';
    const p = { cat, [cat]: cat === 'top' ? 'bomber' : 'cargo', c: {}, marks: [], dets: G.dets };
    for (const st of ['gray', 'color']) assert.doesNotMatch(t.mockupSVG(p, st, 'x'), /NaN|undefined|Infinity/, `${k} ${st}`);
    assert.doesNotMatch(t.flatSVG(p, 'front') + t.flatSVG(p, 'back'), /NaN|undefined|Infinity/, `${k} plat`);
  }
});

test('un détail apparaît dans la bonne vue seulement', () => {
  const nb = (view, dets) => (t.build(Object.assign(avec(dets), { mode: 'outfit', view }), 'v', null).match(/scale\(/g) || []).length;
  assert.equal(nb('front', [{ kind: 'patch', place: 'chest-l' }]) - nb('front', []), 1);
  assert.equal(nb('back', [{ kind: 'patch', place: 'chest-l' }]) - nb('back', []), 0);
  assert.equal(nb('back', [{ kind: 'woven', place: 'neck-in' }]) - nb('back', []), 1);
});

test('la capuche ajoutée passe derrière la tête de face', () => {
  const svg = t.build(Object.assign(avec([{ kind: 'hood', place: 'hood', color: '#c8283c' }]), { mode: 'outfit', top: 'bomber', view: 'front' }), 'h', null);
  const capuche = svg.indexOf('M108 70 Q98 28 150 22'), tete = svg.indexOf('<ellipse cx="150" cy="30"');
  assert.ok(capuche > 0 && tete > 0 && capuche < tete);
});

test('en mode pièce, seuls les détails de la catégorie sont dessinés', () => {
  const G = avec([{ kind: 'cargo', place: 'thigh-l' }, { kind: 'patch', place: 'chest-l' }], { mode: 'piece', cat: 'top', view: 'front' });
  const svg = t.build(G, 'p', null);
  assert.equal((svg.match(/scale\(/g) || []).length, 1);
});

test('les détails voyagent avec la pièce, la tenue et le Lookbook, et vont dans la fiche', () => {
  const t2 = charger();
  t2.S.dets = [{ kind: 'cargo', place: 'thigh-l', color: '#5f6b3a' }, { kind: 'patch', place: 'chest-l', color: '#111214' }].map(d => Object.assign({}, t2.DEFDET, d));
  t2.S.cat = 'bottom';
  const bas = Object.assign(t2.makePiece(), { id: 2 });
  assert.equal(bas.dets.length, 1);
  assert.equal(bas.dets[0].kind, 'cargo');
  assert.match(t2.sheetText(bas), /Détails et fournitures\n- Poche cargo à soufflet · Cuisse gauche · Vert olive \(#5f6b3a\)/);
  const o = t2.mergePiece({ c: {}, acc: {}, marks: [], dets: [{ kind: 'patch', place: 'chest-l' }, { kind: 'welt', place: 'pocket-l' }] }, bas);
  assert.equal(o.dets.map(d => d.kind).join(), 'patch,cargo');
});

test('une ancienne sauvegarde n’a pas de détails ; un détail inconnu est écarté', () => {
  assert.equal(charger().S.dets.length, 0);
  const t2 = charger({ 'atelier-marque-v1': JSON.stringify({ dets: [{ kind: 'inconnu' }, { kind: 'zipv' }] }) });
  assert.equal(t2.S.dets.map(d => d.kind).join(), 'zipv');
  assert.equal(t2.S.dets[0].size, 1);
});

test('initiales de la marque', () => {
  assert.equal(t.initials('Vanta Studio'), 'VS');
  assert.equal(t.initials('chrome'), 'CH');
  assert.equal(t.initials(''), 'M');
});
