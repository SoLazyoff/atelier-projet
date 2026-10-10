import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

function avecCollection() {
  const t = charger();
  t.S.cat = 'top'; t.S.top = 'hoodie'; t.S.pat.top = 'stripe';
  const haut = Object.assign(JSON.parse(JSON.stringify(t.makePiece())), { id: 1, name: 'Hoodie Été' });
  t.S.cat = 'bottom';
  const bas = Object.assign(JSON.parse(JSON.stringify(t.makePiece())), { id: 2 });
  const tenue = { id: 3, kind: 'outfit', name: 'Tenue 1', top: 'bomber', bottom: 'overall', fabric: 'leather', c: Object.assign({}, t.S.c), acc: {}, marks: [] };
  return charger({ 'atelier-marque-v1': JSON.stringify({ looks: [haut, bas, tenue], lookbook: [{ id: 9, name: 'Drop 01', top: 1, bottom: 2, acc: {} }], brand: { name: 'VANTA' } }) });
}

test('sheetData couvre pièce, tenue et look du Lookbook', () => {
  const t = avecCollection();
  assert.equal(t.sheetData('look', 1).G.mode, 'piece');
  assert.equal(t.sheetData('look', 3).G.bottom, 'overall');
  assert.equal(t.sheetData('lb', 9).G.pat.top, 'stripe');
  assert.equal(t.sheetData('look', 42), null);
  assert.equal(t.sheetData('lb', 42), undefined);
});

test('la fiche imprimable a la marque, face et dos, et une pastille par couleur', () => {
  const t = avecCollection();
  for (const [kind, id] of [['look', 1], ['look', 3], ['lb', 9]]) {
    const d = t.sheetData(kind, id);
    const html = t.sheetHTML(d);
    assert.match(html, /<b>VANTA<\/b>/);
    assert.equal((html.match(/<svg /g) || []).length, 2, `${kind} ${id}`);
    const couleurs = (d.text.match(/\(#[0-9a-fA-F]{6}\)/g) || []).length;
    assert.ok(couleurs > 0);
    assert.equal((html.match(/class="psw"/g) || []).length, couleurs);
  }
});

test('le nom de fichier est sûr et lisible', () => {
  const t = charger();
  assert.equal(t.fileName('Hoodie Été / 2', 'png'), 'fiche-hoodie-ete-2.png');
  assert.equal(t.fileName('***', 'pdf'), 'fiche-piece.pdf');
});

test("wrapText coupe aux espaces sans dépasser la largeur", () => {
  const t = charger();
  const mesure = s => s.length * 10;
  const l = t.wrapText('Motif (corps et manches) : Rayures, Blanc cassé (#f3f1ea)', 200, mesure);
  assert.ok(l.length > 1);
  assert.ok(l.every(x => mesure(x) <= 200 || !x.includes(' ')));
  assert.equal(l.join(' '), 'Motif (corps et manches) : Rayures, Blanc cassé (#f3f1ea)');
  assert.equal(t.wrapText('', 200, mesure).join(), '');
});

test('vbOf lit le cadrage du SVG pour garder les proportions', () => {
  const t = charger();
  const v = t.vbOf(t.build(Object.assign({}, t.S, { mode: 'piece', cat: 'top', top: 'denimlong' }), 'v', null));
  assert.equal(`${v.w}x${v.h}`, '300x300');
});
