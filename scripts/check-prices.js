const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { loadPoodles, savePoodles, loadHistory, saveHistory } = require('./utils');

async function checkPoodlePrice(poodle) {
  if (!poodle.url || poodle.type !== 'venta') return null;
  if (!poodle.url.startsWith('http')) return null;

  try {
    const res = await fetch(poodle.url, { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /S\/[.\s]*(\d[\d,.\s]*)/i,
      /precio[:\s]*S\/[.\s]*(\d[\d,.\s]*)/i,
      /price[:\s]*["']?(\d+)/i,
      /S\/[.\s]*(\d+[\d,.]*\d+)/i,
      /(\d[\d,]*)\s*(?:soles|sol)/i
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        const price = parseInt(match[1].replace(/[.,\s]/g, ''));
        if (price > 0 && price < 99999) return price;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('=== Verificador de Precios ===\n');
  const data = loadPoodles();
  const history = loadHistory();
  const today = new Date().toISOString().split('T')[0];
  const alerts = [];

  if (!history.priceHistory) history.priceHistory = {};

  for (const poodle of data.poodles) {
    if (poodle.type !== 'venta' || !poodle.wa) continue;
    process.stdout.write(`  ${poodle.title.substring(0, 40).padEnd(42)}`);
    const currentPrice = poodle.price;
    const foundPrice = await checkPoodlePrice(poodle);
    if (!foundPrice) {
      console.log(`[SIN CAMBIO] S/${currentPrice} (no se pudo verificar)`);
      continue;
    }
    if (!history.priceHistory[poodle.id]) {
      history.priceHistory[poodle.id] = [];
    }
    history.priceHistory[poodle.id].push({ price: foundPrice, date: today, previousPrice: currentPrice });

    if (foundPrice !== currentPrice) {
      if (foundPrice < currentPrice) {
        const drop = currentPrice - foundPrice;
        const pct = Math.round((drop / currentPrice) * 100);
        alerts.push({
          poodle,
          oldPrice: currentPrice,
          newPrice: foundPrice,
          drop,
          pct,
          type: 'baja'
        });
        console.log(`[BAJA!] S/${currentPrice} → S/${foundPrice} (-S/${drop}, -${pct}%)`);
        poodle.price = foundPrice;
        poodle.lastChecked = today;
      } else if (foundPrice > currentPrice) {
        alerts.push({
          poodle,
          oldPrice: currentPrice,
          newPrice: foundPrice,
          type: 'subida'
        });
        console.log(`[SUBIO] S/${currentPrice} → S/${foundPrice}`);
      } else {
        console.log(`[OK] S/${currentPrice}`);
      }
    } else {
      console.log(`[OK] S/${currentPrice}`);
    }
    poodle.lastChecked = today;
  }

  saveHistory(history);
  savePoodles(data);

  console.log(`\n=== Resultados ===`);
  console.log(`Precios verificados: ${data.poodles.filter(p => p.type === 'venta').length}`);
  console.log(`Alertas de baja: ${alerts.filter(a => a.type === 'baja').length}`);
  console.log(`Alertas de subida: ${alerts.filter(a => a.type === 'subida').length}`);

  alerts.filter(a => a.type === 'baja').forEach(a => {
    console.log(`\n*** BAJA DE PRECIO: ${a.poodle.title} ***`);
    console.log(`    S/${a.oldPrice} → S/${a.newPrice} (ahorras S/${a.drop})`);
    console.log(`    WhatsApp: ${a.poodle.wa ? `https://wa.me/${a.poodle.wa}` : 'No disponible'}`);
  });

  return alerts;
}

if (require.main === module) {
  run().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { run, checkPoodlePrice };
