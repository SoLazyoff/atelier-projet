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
