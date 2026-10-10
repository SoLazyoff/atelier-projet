import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const t = charger();

test('chaque coupe a son mockup gris face + dos, sans valeur invalide ni couleur de pièce', () => {
  for (const [cat, key] of [['top', 'TOPS'], ['bottom', 'BOTTOMS']]) {
    for (const cut of Object.keys(t[key])) {
      const svg = t.mockupSVG({ cat, [cat]: cut, c: {}, marks: [] }, 'gray', 'g');
      assert.doesNotMatch(svg, /NaN|Infinity|undefined/, cut);
      assert.equal((svg.match(/<g transform/g) || []).length, 2, cut);
      assert.match(svg, /fill="#d5d6d9"/, cut);
      assert.doesNotMatch(svg, /url\(#/, cut);
    }
  }
});

test('le mockup couleur reprend les couleurs, le motif et les surpiqûres de la pièce', () => {
  const t2 = charger();
  t2.S.cat = 'top'; t2.S.top = 'hoodie'; t2.S.c.tBody = '#c8283c'; t2.S.c.stitch = '#e7b93c'; t2.S.pat.top = 'stripe';
  const p = Object.assign(t2.makePiece(), { id: 5 });
  const svg = t2.mockupSVG(p, 'color', 'c5');
  assert.match(svg, /fill="#c8283c"/);
  assert.match(svg, /stroke="#e7b93c"/);
  assert.match(svg, /<pattern id="pattc5front"/);
  assert.match(svg, /url\(#pattc5front\)/);
  assert.doesNotMatch(svg, /NaN|undefined/);
});

test('le dessin technique coté reste au trait noir sur blanc', () => {
  const svg = t.flatSVG({ cat: 'top', top: 'bomber', c: {}, marks: [] }, 'front');
  assert.match(svg, /fill="#fff" stroke="#111"/);
});

test('la collection s’ouvre sur les mockups ; une ancienne sauvegarde aussi', () => {
  const t2 = charger({ 'atelier-marque-v1': JSON.stringify({ looks: [] }) });
  assert.equal(t2.S.collView, 'mock');
  assert.equal(t2.S.libCat, 'all');
  const html = t2.collection();
  assert.match(html, /class="mockroom"/);
  assert.equal((html.match(/data-act="libUse"/g) || []).length, t2.libItems().length);
  assert.equal(t2.libItems().length, Object.keys(t2.TOPS).length + Object.keys(t2.BOTTOMS).length);
});

test('le filtre Bas ne montre que les bas, et mes pièces apparaissent en couleur', () => {
  const t2 = charger();
  t2.S.cat = 'bottom'; t2.S.bottom = 'cargo';
  t2.S.looks.push(Object.assign(t2.makePiece(), { id: 11 }));
  t2.S.libCat = 'bottom';
  const html = t2.collection();
  assert.equal((html.match(/data-act="libUse"/g) || []).length, Object.keys(t2.BOTTOMS).length);
  assert.match(html, /data-act="mockSel" data-k="11"/);
  assert.match(html, /Mes mockups \(1\)/);
});

test('la vue Fiches garde le sélecteur et la liste existante', () => {
  const t2 = charger();
  t2.S.collView = 'fiches';
  assert.match(t2.collection(), /data-act="collView" data-k="fiches" aria-pressed="true"/);
  assert.doesNotMatch(t2.collection(), /mockroom/);
});

test('la recherche accepte les noms anglais et les accents français', () => {
  const t2 = charger();
  const trouve = q => t2.libItems().filter(m => t2.libHit(m, q)).map(m => m.k).join(',');
  assert.equal(trouve('puffer'), 'puffer,pufvest');
  assert.match(trouve('Tee'), /tshirt/);
  assert.equal(trouve('salopette'), 'overall');
  assert.equal(trouve('veste universitaire'), 'varsity');
  assert.equal(trouve('  '), t2.libItems().map(m => m.k).join(','));
});
