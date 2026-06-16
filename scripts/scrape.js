const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { loadPoodles, savePoodles, loadHistory, saveHistory, isValidLimaLocation, getQPVBase } = require('./utils');

const COLOR_KEYWORDS = { marron: ['marron', 'chocolate', 'brown', 'cafe'], apricot: ['apricot', 'albaricoque', 'damasco'], rojo: ['rojo', 'red', 'pimenton', 'vino'] };
const COLOR_PRIORITY = { marron: ['marron', 'chocolate'], apricot: ['apricot', 'damasco'], rojo: ['rojo', 'pimenton'] };

function detectColor(text) {
  const t = text.toLowerCase();
  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.some(k => t.includes(k))) return color;
  }
  return null;
}

function detectSize(text) {
  const t = text.toLowerCase();
  if (t.includes('toy') || t.includes('minitoy')) return 'miniatura';
  if (t.includes('mini') || t.includes('miniatura') || t.includes('enano')) return t.includes('enano') ? 'enano' : 'miniatura';
  return 'miniatura';
}

function detectPrice(text) {
  const matches = text.match(/s\/[.\s]*(\d[\d,.\s]*)/i);
  if (matches) return parseInt(matches[1].replace(/[.,\s]/g, ''));
  return null;
}

async function scrapeWUF() {
  console.log('[WUF] Scraping wuf.pe/adoptawuf...');
  try {
    const res = await fetch('https://wuf.pe/adoptawuf', { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('article, .pet-card, .animal-card, .adopcion-item').each((i, el) => {
      const text = $(el).text();
      const link = $(el).find('a').first().attr('href') || '';
      if (text.toLowerCase().includes('poodle') || text.toLowerCase().includes('caniche')) {
        results.push({ title: text.trim().substring(0, 80), url: link.startsWith('http') ? link : `https://wuf.pe${link}`, source: 'wuf', type: 'adopcion', price: 0, notes: 'Encontrado en WUF Peru' });
      }
    });
    console.log(`[WUF] ${results.length} posibles candidatos`);
    return results;
  } catch (e) {
    console.log(`[WUF] Error: ${e.message}`);
    return [];
  }
}

async function scrapeMercadoLibre() {
  console.log('[ML] Scraping MercadoLibre Peru...');
  const urls = [
    'https://listado.mercadolibre.pe/perros/poodle-miniatura-enano',
    'https://listado.mercadolibre.pe/cachorros-poodle',
    'https://listado.mercadolibre.pe/perros/poodle-enano'
  ];
  const results = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const $ = cheerio.load(html);
      $('.ui-search-layout__item, .andes-card').each((i, el) => {
        const title = $(el).find('.ui-search-item__title, .poly-component__title').text().trim();
        const priceEl = $(el).find('.andes-money-amount__fraction, .poly-price__current .andes-money-amount__fraction').first();
        const link = $(el).find('a').first().attr('href') || '';
        const location = $(el).find('.ui-search-item__location, .poly-component__location').text().trim();
        if (!title) return;
        const t = title.toLowerCase();
        if (!t.includes('poodle') && !t.includes('caniche')) return;
        const color = detectColor(title);
        const size = detectSize(title);
        const price = priceEl.length ? parseInt(priceEl.text().replace(/[.,\s]/g, '')) : null;
        const limaOk = isValidLimaLocation(location || title);
        if (!limaOk && !location.toLowerCase().includes('lima') && !title.toLowerCase().includes('lima')) return;
        if (color && !['marron', 'apricot', 'rojo'].includes(color)) return;
        if (results.some(r => r.url === link)) return;
        results.push({ title, price, url: link, location, source: 'mercadolibre', color, size, type: 'venta', notes: `Encontrado en ML · ${location}` });
      });
    } catch (e) {
      console.log(`[ML] Error en ${url}: ${e.message}`);
    }
  }
  console.log(`[ML] ${results.length} posibles candidatos`);
  return results;
}

async function scrapeOLX() {
  console.log('[OLX] Scraping OLX Peru...');
  try {
    const res = await fetch('https://www.olx.pe/animales-mascotas/perros/poodle/', { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.log(`[OLX] HTTP ${res.status}`); return []; }
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('li[data-cy="l-card"], .listing-card, article').each((i, el) => {
      const title = $(el).find('.title, h2, h3, a[title]').first().text().trim() || $(el).attr('title') || '';
      if (!title) return;
      const t = title.toLowerCase();
      if (!t.includes('poodle') && !t.includes('caniche')) return;
      const link = $(el).find('a').first().attr('href') || '';
      const fullLink = link.startsWith('http') ? link : `https://www.olx.pe${link}`;
      const priceText = $(el).find('.price, [data-testid="ad-price"]').text().trim();
      const price = priceText ? parseInt(priceText.replace(/[^\d]/g, '')) : null;
      const location = $(el).find('[data-testid="location"], .location, span:contains("Lima")').first().text().trim() || 'Lima';
      const color = detectColor(title);
      const size = detectSize(title);
      if (price && price > 4000) return;
      if (color && !['marron', 'apricot', 'rojo'].includes(color)) return;
      results.push({ title, price, url: fullLink, location, source: 'olx', color: color || 'apricot', size, type: 'venta', notes: `Encontrado en OLX · ${location}` });
    });
    console.log(`[OLX] ${results.length} posibles candidatos`);
    return results;
  } catch (e) {
    console.log(`[OLX] Error: ${e.message}`);
    return [];
  }
}

async function scrapeAdoptaLima() {
  console.log('[AdoptaLima] Scraping adoptalima.org...');
  try {
    const res = await fetch('https://adoptalima.org/adopta/', { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.log(`[AdoptaLima] HTTP ${res.status}`); return []; }
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('article, .pet-card, .animal-card, .entry, .post, .adopcion-item, .grid-item').each((i, el) => {
      const text = $(el).text();
      const link = $(el).find('a').first().attr('href') || '';
      if (!text.toLowerCase().includes('poodle') && !text.toLowerCase().includes('caniche')) return;
      const title = $(el).find('h2, h3, .title').first().text().trim() || text.trim().substring(0, 80);
      const fullLink = link.startsWith('http') ? link : `https://adoptalima.org${link}`;
      results.push({ title, url: fullLink, source: 'adoptalima', type: 'adopcion', price: 0, location: 'Lima', notes: 'Encontrado en Adopta Lima' });
    });
    if (results.length === 0 && html.toLowerCase().includes('poodle')) {
      results.push({ title: 'Adopta Lima - Posible poodle disponible', url: 'https://adoptalima.org/adopta/', source: 'adoptalima', type: 'adopcion', price: 0, location: 'Lima', notes: 'Adopta Lima · Revisar pagina para detalles', status: 'consultar' });
    }
    console.log(`[AdoptaLima] ${results.length} posibles candidatos`);
    return results;
  } catch (e) {
    console.log(`[AdoptaLima] Error: ${e.message}`);
    return [];
  }
}

async function scrapeBreeder(url, name, sourceKey) {
  console.log(`[${sourceKey}] Scraping ${name}...`);
  try {
    const res = await fetch(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    const text = $('body').text();
    const title = $('title').text();
    if (!text.toLowerCase().includes('poodle') && !text.toLowerCase().includes('caniche') && !text.toLowerCase().includes('cachorro')) {
      console.log(`[${sourceKey}] Sin resultados relevantes en pagina principal`);
      return [];
    }
    $('h1, h2, h3, h4, .product-title, .product-name, .entry-title, .card-title').each((i, el) => {
      const t = $(el).text().trim();
      if (!t) return;
      const tl = t.toLowerCase();
      if (!tl.includes('poodle') && !tl.includes('caniche') && !tl.includes('cachorro') && !tl.includes('mini')) return;
      const color = detectColor(t);
      if (color && !['marron', 'apricot', 'rojo'].includes(color)) return;
      const price = detectPrice(text);
      const size = detectSize(t);
      const link = $(el).closest('a').attr('href') || $(el).find('a').attr('href') || url;
      results.push({ title: t, url: link.startsWith('http') ? link : `${url.replace(/\/$/, '')}/${link.replace(/^\//, '')}`, source: sourceKey, type: 'venta', color: color || 'apricot', size, price: price || null, notes: `Disponible en ${name}` });
    });
    if (results.length === 0 && (text.toLowerCase().includes('poodle') || title.toLowerCase().includes('poodle'))) {
      results.push({ title: `${name} - Ver disponibilidad`, url, source: sourceKey, type: 'venta', color: null, size: null, price: null, notes: `${name} · Consultar disponibilidad por WhatsApp`, status: 'consultar' });
    }
    console.log(`[${sourceKey}] ${results.length} resultados`);
    return results;
  } catch (e) {
    console.log(`[${sourceKey}] Error: ${e.message}`);
    return [];
  }
}

async function run() {
  console.log('=== Poodle Lima Scraper ===\n');
  const allCandidates = [];

  const sources = [
    { fn: scrapeWUF },
    { fn: scrapeAdoptaLima },
    { fn: scrapeMercadoLibre },
    { fn: scrapeOLX },
    { fn: () => scrapeBreeder('https://puppytoyperuoficial.com/cachorros.html', 'Puppy Toy Peru', 'puppy_toy_peru') },
    { fn: () => scrapeBreeder('https://puppytoyperu.com/tienda/', 'Puppy Toy Peru (tienda)', 'puppy_toy_peru') },
    { fn: () => scrapeBreeder('https://cachorrosperu.pe/categoria/raza-miniatura/', 'Premium Kennel', 'premium_kennel') },
    { fn: () => scrapeBreeder('https://limaonepets.com/cachorros/', 'Lima Onepets', 'lima_onepets') },
    { fn: () => scrapeBreeder('https://happypets.pe/product-category/perros/poodle/', 'Happy Pets', 'happy_pets') },
    { fn: () => scrapeBreeder('https://centralpetsperu.com/product/poodle-toy/', 'Central Pets Peru', 'central_pets') }
  ];

  for (const source of sources) {
    try {
      const results = await source.fn();
      allCandidates.push(...results);
    } catch (e) {
      console.log(`Source error: ${e.message}`);
    }
  }

  console.log(`\nTotal candidatos: ${allCandidates.length}`);

  const existing = loadPoodles();
  const history = loadHistory();
  let newCount = 0;
  const today = new Date().toISOString().split('T')[0];

  for (const candidate of allCandidates) {
    const exists = existing.poodles.some(p =>
      p.url === candidate.url ||
      (candidate.title && p.title.toLowerCase().includes(candidate.title.substring(0, 20).toLowerCase()))
    );
    if (exists) continue;

    const color = candidate.color || 'apricot';
    if (!['marron', 'apricot', 'rojo'].includes(color)) continue;

    const newId = Math.max(...existing.poodles.map(p => p.id), 0) + 1 + newCount;
    const size = candidate.size || 'miniatura';
    const qpvBase = candidate.type === 'adopcion' ? 100 : getQPVBase(candidate.price || 3500, 'venta');

    const bonuses = ['color_prioritario', 'tamano_ideal'];
    if (candidate.source === 'wuf' || candidate.source === 'adoptalima') bonuses.push('vacunas', 'refugio_oficial');
    if (['puppy_toy_peru', 'premium_kennel', 'lima_onepets', 'central_pets'].includes(candidate.source)) bonuses.push('criador_verificado');

    const penalties = [];
    if (!candidate.wa && (candidate.source === 'olx' || candidate.source === 'mercadolibre')) penalties.push('sin_wa');
    if (!candidate.url || candidate.url === candidate.url.replace(/\/[^/]+$/, '/')) penalties.push('enlace_generico');

    const poodle = {
      id: newId,
      title: candidate.title,
      subtitle: candidate.source === 'wuf' ? 'WUF Peru - Adopcion' : candidate.source === 'mercadolibre' ? `MercadoLibre · ${candidate.location || 'Lima'}` : candidate.notes || `${candidate.source} · Lima`,
      type: candidate.type || 'venta',
      price: candidate.price || 0,
      color,
      size,
      location: candidate.location || (candidate.source === 'wuf' ? 'Lima' : 'Lima'),
      contact: candidate.source === 'wuf' ? 'WUF Peru' : candidate.source === 'mercadolibre' ? 'MercadoLibre' : `${candidate.source}`,
      wa: '',
      url: candidate.url || '',
      source: candidate.source || 'web',
      notes: candidate.notes || `Agregado automaticamente desde ${candidate.source}`,
      badges: candidate.source === 'wuf' ? ['refugio_oficial', 'lima_verificado'] : ['lima_verificado'],
      status: candidate.status || 'consultar',
      qpvBase,
      bonuses,
      penalties,
      addedAt: today,
      lastChecked: today
    };

    existing.poodles.push(poodle);
    newCount++;
    console.log(`[NUEVO] #${newId}: ${poodle.title} (${color}, ${poodle.type === 'adopcion' ? 'GRATIS' : `S/${poodle.price}`})`);
  }

  existing.lastScraped = today;
  savePoodles(existing);

  const scrapedIds = allCandidates.map(c => c.url);
  existing.poodles.forEach(p => {
    if (scrapedIds.includes(p.url) || ['puppy_toy_peru', 'premium_kennel', 'lima_onepets', 'happy_pets', 'lima_pets', 'central_pets', 'olx'].includes(p.source)) {
      p.lastChecked = today;
    }
  });
  savePoodles(existing);

  console.log(`\n=== Scraping completado ===`);
  console.log(`Total: ${existing.poodles.length} poodles`);
  console.log(`Nuevos: ${newCount}`);
  return { newCount, total: existing.poodles.length };
}

if (require.main === module) {
  run().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { run, scrapeWUF, scrapeMercadoLibre, scrapeOLX, scrapeAdoptaLima, scrapeBreeder };
