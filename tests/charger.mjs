// Charge le script d'atelier.html dans Node avec un faux DOM minimal,
// pour tester les fonctions pures sans navigateur.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

export function charger(stockage = {}) {
  const html = readFileSync(new URL('../atelier.html', import.meta.url), 'utf8');
  const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const el = () => ({ innerHTML: '', textContent: '', style: {}, classList: { add() {}, remove() {} }, setAttribute() {} });
  const ctx = {
    console,
    localStorage: { getItem: k => stockage[k] ?? null, setItem: (k, v) => { stockage[k] = v; } },
    document: { addEventListener() {}, querySelector: el, querySelectorAll: () => [] },
    window: { scrollTo() {} },
    navigator: {},
    setTimeout, clearTimeout,
  };
  vm.createContext(ctx);
  vm.runInContext(code + '\n;globalThis.__t={mergePiece,applyPiece,makePiece,load,build,DEF,DEFMARK,ACC0,get S(){return S},set S(v){S=v}' +
    (code.includes('function lookG(') ? ',lookG,lbSheet,lbUses' : '') + '};', ctx);
  return ctx.__t;
}
