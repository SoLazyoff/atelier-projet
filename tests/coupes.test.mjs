import { test } from 'node:test';
import assert from 'node:assert/strict';
import { charger } from './charger.mjs';

const t = charger();
const zonesVues = (G) => ['front', 'back'].map(view => t.build(Object.assign({}, G, { view }), 'z', null)).join('');

for (const k of Object.keys(t.TOPS)) {
  test(`haut « ${k} » : chaque zone est dessinée, face ou dos, en pièce et en tenue`, () => {
    for (const mode of ['piece', 'outfit']) {
      const svg = zonesVues(Object.assign({}, t.S, { mode, cat: 'top', top: k }));
      for (const z of Object.keys(t.TOPS[k].zones)) assert.match(svg, new RegExp(`data-p="${z}"`), `${mode} : zone ${z}`);
    }
  });
}

for (const k of Object.keys(t.BOTTOMS)) {
  test(`bas « ${k} » : chaque zone est dessinée, face ou dos, en pièce et en tenue`, () => {
    for (const mode of ['piece', 'outfit']) {
      const svg = zonesVues(Object.assign({}, t.S, { mode, cat: 'bottom', bottom: k }));
      for (const z of Object.keys(t.BOTTOMS[k].zones)) assert.match(svg, new RegExp(`data-p="${z}"`), `${mode} : zone ${z}`);
    }
  });
}

test('la bavette de salopette passe sur un t-shirt mais sous une veste', () => {
  const bavette = 'M112 112 L188 112 L192 214 L108 214 Z';
  const ordre = (top) => {
    const svg = t.build(Object.assign({}, t.S, { mode: 'outfit', top, bottom: 'overall', view: 'front' }), 'o', null);
    return svg.indexOf(bavette) > svg.lastIndexOf('data-p="tBody"');
  };
  assert.equal(ordre('tshirt'), true);
  assert.equal(ordre('bomber'), false);
});
