import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const t = charger();

test('chaque coupe a ses mesures de base, avec libellé, gradation et tolérance', () => {
  for (const [cat, cuts] of [['top', t.TOPS], ['bottom', t.BOTTOMS]]) {
    for (const cut of Object.keys(cuts)) {
      const spec = t.SPEC[cut];
      assert.ok(spec, `${cut} sans mesures`);
      for (const k of Object.keys(spec)) {
        assert.ok(t.POM[cat][k] && t.GRADE[cat][k] && t.TOL[cat][k], `${cut}.${k}`);
      }
    }
  }
});

test('la gradation part de M et suit le pas de chaque mesure', () => {
  const rows = t.specRows({ cat: 'top', top: 'hoodie' });
  const P = rows.find(r => r.k === 'P');
  assert.equal(P.vals.join(), '60,62,64,66,68');
  assert.equal(rows[0].letter, 'A');
  assert.equal(rows.map(r => r.k).join(''), 'LEPBMWH');
});

test('une mesure modifiée remplace la valeur par défaut, une valeur invalide est ignorée', () => {
  const rows = t.specRows({ cat: 'bottom', bottom: 'jean', spec: { C: 100, I: NaN } });
  const C = rows.find(r => r.k === 'C'), I = rows.find(r => r.k === 'I');
  assert.equal(C.vals[1], 100);
  assert.equal(C.custom, true);
  assert.equal(I.vals[1], 80);
  assert.equal(I.custom, false);
});

test('accessoires et coupes inconnues n’ont pas de grille', () => {
  assert.equal(t.specRows({ cat: 'acc', group: 'head', opt: 'cap' }).length, 0);
  assert.equal(t.specRows({ cat: 'top', top: 'inconnu' }).length, 0);
});

test('la fiche d’une pièce contient la grille de mesures', () => {
  const t2 = charger();
  t2.S.cat = 'bottom'; t2.S.bottom = 'skirt';
  const txt = t2.sheetText(t2.makePiece());
  assert.match(txt, /Mesures en cm \(S \/ M \/ L \/ XL \/ XXL\)/);
  assert.match(txt, /- A\. Demi-tour de taille : 36 \/ 38 \/ 40 \/ 42 \/ 44 \(tolérance ±1\)/);
  assert.doesNotMatch(txt, /Entrejambe/);
});

const lettres = svg => [...svg.matchAll(/font-weight="700" fill="#fff"[^>]*>([A-Z])</g)].map(m => m[1]);

for (const [cat, key] of [['top', 'TOPS'], ['bottom', 'BOTTOMS']]) {
  test(`dessins à plat des ${cat === 'top' ? 'hauts' : 'bas'} : chaque repère coté une fois, sans valeur invalide`, () => {
    for (const cut of Object.keys(t[key])) {
      const p = { cat, [cat]: cut, c: {}, marks: [] };
      const f = t.flatSVG(p, 'front'), b = t.flatSVG(p, 'back');
      assert.doesNotMatch(f + b, /NaN|Infinity/, cut);
      const vues = lettres(f).concat(lettres(b)).sort().join('');
      const attendu = t.specRows(p).map(r => r.letter).join('');
      assert.equal(vues, attendu, cut);
      assert.doesNotMatch(f, /data-p=|url\(#/, `${cut} : pas de couleur ni d'ombrage`);
    }
  });
}

test('vertsOf ignore les points de contrôle des courbes', () => {
  assert.equal(JSON.stringify(t.vertsOf('M97 214 L150 214 L152 330 Q152 404 142 438 Z')), '[[97,214],[150,214],[152,330],[142,438]]');
});

test("l'entrejambe du pantalon parachute part de l'entrejambe dessiné (y = 330)", () => {
  const b = t.flatSVG({ cat: 'bottom', bottom: 'para', c: {}, marks: [] }, 'back');
  assert.match(b, /M150 330 L150 452/);
});
