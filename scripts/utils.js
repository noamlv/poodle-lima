const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const POODLES_FILE = path.join(DATA_DIR, 'poodles.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

const QPV_BASE = {
  adopcion: 100,
  venta_1800_2500: 90,
  venta_2500_2800: 85,
  venta_3000_3500: 75,
  venta_3800_4000: 70
};

const BONUSES = {
  color_prioritario: 5,
  tamano_ideal: 5,
  criador_verificado: 10,
  vacunas: 5,
  pedigree: 5,
  garantia_salud: 5,
  esterilizado: 3
};

const PENALTIES = {
  sin_wa: -10,
  sin_datos_salud: -10,
  ubicacion_no_verif: -20,
  precio_alto_sin_pedigree: -15,
  enlace_generico: -10
};

function getQPVBase(price, type) {
  if (type === 'adopcion') return 100;
  if (price <= 2500) return 90;
  if (price <= 2800) return 85;
  if (price <= 3500) return 75;
  if (price <= 4000) return 70;
  return 0;
}

function calcQPV(poodle) {
  const base = poodle.qpvBase || getQPVBase(poodle.price, poodle.type);
  let bonusPts = 0;
  let penaltyPts = 0;
  (poodle.bonuses || []).forEach(b => { if (BONUSES[b]) bonusPts += BONUSES[b]; });
  (poodle.penalties || []).forEach(p => { if (PENALTIES[p]) penaltyPts += PENALTIES[p]; });
  return Math.max(0, base + bonusPts + penaltyPts);
}

function loadPoodles() {
  if (!fs.existsSync(POODLES_FILE)) return { version: 1, lastUpdated: new Date().toISOString().split('T')[0], lastScraped: null, poodles: [] };
  return JSON.parse(fs.readFileSync(POODLES_FILE, 'utf8'));
}

function savePoodles(data) {
  data.lastUpdated = new Date().toISOString().split('T')[0];
  data.poodles.forEach(p => { p.qpv = calcQPV(p); });
  data.poodles.sort((a, b) => (b.qpv || 0) - (a.qpv || 0));
  data.poodles.forEach((p, i) => { p.rank = i + 1; });
  fs.writeFileSync(POODLES_FILE, JSON.stringify(data, null, 2));
}

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return { priceHistory: {}, addedHistory: {}, removedHistory: [] };
  return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
}

function saveHistory(data) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
}

function isValidLimaLocation(location) {
  const limaDistricts = [
    'lima', 'surco', 'miraflores', 'san borja', 'san isidro', 'la molina',
    'santiago de surco', 'barranco', 'chorrillos', 'magdalena', 'jesus maria',
    'lince', 'san miguel', 'pueblo libre', 'los olivos', 'san martin de porres',
    'comas', 'independencia', 'san juan de lurigancho', 'sjl', 'smp',
    'cieneguilla', 'ate', 'vitarte', 'sjm', 'san juan de miraflores',
    'villa el salvador', 'villa maria del triunfo', 'carabayllo', 'punta negra',
    'san bartolo', 'santa rosa', 'ancón', 'rimac', 'el agustino', 'breña'
  ];
  const loc = location.toLowerCase();
  return limaDistricts.some(d => loc.includes(d)) || loc.includes('lima');
}

module.exports = {
  DATA_DIR, POODLES_FILE, HISTORY_FILE,
  QPV_BASE, BONUSES, PENALTIES,
  getQPVBase, calcQPV,
  loadPoodles, savePoodles,
  loadHistory, saveHistory,
  isValidLimaLocation
};
