// scripts/sanitize.js
// Limpia data/poodles.json de entradas invalidas que el scraper pudo haber colado:
//  - razas que no son Poodle (Pinscher/Schnauzer/Yorkshire/etc.)
//  - colores fuera de criterio (blanco/negro/beige/merle/crema...)
//  - tamanos Mini Toy (<28cm)
//  - precios basura (anios parseados, 0 o 1 en listings de venta de criadero)
// Regla conservadora: NUNCA toca listings de adopcion ni los agregados manualmente
// de redes sociales (source: tiktok/instagram/facebook/wuf/adoptalima) salvo su precio.

const { loadPoodles, savePoodles } = require('./utils');

const ALLOWED_COLORS = ['marron', 'apricot', 'rojo'];
const EXCLUDED_COLOR_KEYWORDS = ['blanco', 'white', 'negro', 'black', 'beige', 'crema', 'cream', 'plateado', 'plata', 'silver', 'gris', 'gray', 'grey', 'merle', 'exotico', 'exótico', 'multicolor', 'particolor', 'tricolor'];
const NON_POODLE_KEYWORDS = ['pinscher', 'schnauzer', 'yorkshire', 'yorkie', 'shih', 'pomerania', 'poma', 'chihuahua', 'maltese', 'maltés', 'malties', 'bichon', 'bulldog', 'frances', 'labrador', 'golden', 'beagle', 'husky', 'siberiano', 'samoyedo', 'corgi', 'dalmata', 'dálmata', 'mestizo', 'cruza'];
const BREEDER_SOURCES = ['puppy_toy_peru', 'premium_kennel', 'lima_onepets', 'happy_pets', 'lima_pets', 'central_pets'];
const SOCIAL_SOURCES = ['tiktok', 'instagram', 'facebook', 'wuf', 'adoptalima'];

function hasExcludedColor(text) {
  const t = (text || '').toLowerCase();
  return EXCLUDED_COLOR_KEYWORDS.some(k => t.includes(k));
}
function isNonPoodle(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('poodle') || t.includes('caniche')) return false;
  return NON_POODLE_KEYWORDS.some(k => t.includes(k));
}
// Precio "basura": ano (1990-2099) o <=2. Se deja null + consultar.
function isBogusPrice(p) {
  if (p == null || p === 0) return false; // 0 es valido para adopcion
  if (p >= 1990 && p <= 2099) return true;
  if (p <= 2) return true;
  return false;
}

function run() {
  const data = loadPoodles();
  const before = data.poodles.length;
  const removed = [];
  const repaired = [];

  data.poodles = data.poodles.filter(p => {
    const title = p.title || '';
    const isBreeder = BREEDER_SOURCES.includes(p.source);
    const isSocial = SOCIAL_SOURCES.includes(p.source);

    // 1) Criadero con raza que definitivamente no es Poodle -> eliminar
    if (isBreeder && isNonPoodle(title)) {
      removed.push(`#${p.id} ${title} (raza no-Poodle)`);
      return false;
    }
    // 2) Titulo con color excluido -> eliminar
    if (isBreeder && hasExcludedColor(title)) {
      removed.push(`#${p.id} ${title} (color excluido)`);
      return false;
    }
    // 3) Mini Toy -> eliminar
    if (isBreeder && /mini\s*toy|minitoysto/.test(title.toLowerCase())) {
      removed.push(`#${p.id} ${title} (mini toy)`);
      return false;
    }
    // 4) Color almacenado fuera de criterio en un listing de criadero -> eliminar
    if (isBreeder && p.color && !ALLOWED_COLORS.includes(p.color)) {
      removed.push(`#${p.id} ${title} (color almacenado ${p.color})`);
      return false;
    }

    // 5) Reparar precios basura (anios o S/1) sin borrar el listing
    if (p.type === 'venta' && isBogusPrice(p.price)) {
      repaired.push(`#${p.id} ${title}: S/${p.price} -> consultar`);
      p.price = null;
      p.status = 'consultar';
    }
    return true;
  });

  savePoodles(data);
  console.log(`Saneo: ${before} -> ${data.poodles.length} poodles`);
  if (removed.length) console.log('Eliminados:\n  ' + removed.join('\n  '));
  if (repaired.length) console.log('Reparados (precio):\n  ' + repaired.join('\n  '));
  return { removed, repaired };
}

if (require.main === module) run();
module.exports = { run };
