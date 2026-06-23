const fs = require('fs');
const path = require('path');
const { loadPoodles, calcQPV, BONUSES, PENALTIES } = require('./utils');

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(__dirname, '..', 'poodles.html');

const getQPVClass = (qpv) => {
  if (qpv >= 95) return 'qpv-excelente';
  if (qpv >= 80) return 'qpv-bueno';
  if (qpv >= 70) return 'qpv-justo';
  return 'qpv-alto';
};

function escHtml(s) { if (typeof s !== 'string') return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function generate() {
  const data = loadPoodles();
  const poodles = data.poodles;

  poodles.forEach(p => { p.qpv = calcQPV(p); });
  poodles.sort((a, b) => b.qpv - a.qpv);
  poodles.forEach((p, i) => { p.rank = i + 1; });

  const cardsHTML = poodles.map((p, i) => {
    const rank = i + 1;
    const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
    const cardClass = rank <= 3 ? `top3 ${rankClass}` : '';
    const qpvClass = getQPVClass(p.qpv);

    const precioHTML = p.price === 0
      ? '<span class="precio-valor precio-gratis">GRATIS</span>'
      : `<span class="precio-valor">S/ ${p.price.toLocaleString()}</span>`;

    const colorLabel = { marron: 'Marron', apricot: 'Apricot', rojo: 'Rojo' }[p.color] || p.color;
    const tamanoLabel = { enano: 'Enano 28-35cm', miniatura: 'Miniatura 35-45cm' }[p.size] || p.size;
    const tipoLabel = p.type === 'adopcion' ? 'Adopcion' : 'Venta';
    const estadoLabel = p.status === 'disponible' ? 'Disponible' : 'Consultar';
    const estadoClass = p.status === 'disponible' ? 'estado-disponible' : 'estado-consultar';

    const badgeLabels = {
      criadero_certificado: 'Criadero Certificado', criadero_oficial: 'Oficial',
      pedigree: 'Pedigree', vacunas: 'Vacunas', garantia: 'Garantia',
      garantia_salud: 'Garantia Salud', esterilizado: 'Esterilizado',
      refugio_oficial: 'Refugio', padres_presentes: 'Padres presentes',
      lima_verificado: 'Lima', publicado_reciente: 'Reciente',
      caso_especial: 'Caso especial', criadero_verificado: 'Criadero Verificado'
    };
    const badgeClass = (v) => {
      if (['pedigree','criadero_certificado','criadero_verificado','criadero_oficial'].includes(v)) return 'pedigree';
      if (['vacunas','esterilizado','refugio_oficial'].includes(v)) return 'vacunas';
      if (['garantia','garantia_salud'].includes(v)) return 'garantia';
      return '';
    };
    const verifHTML = (p.badges || []).map(v =>
      `<span class="verif-badge ${badgeClass(v)}">${badgeLabels[v] || v}</span>`
    ).join('');

    const qpvBonuses = (p.bonuses || []).map(b => {
      const pts = BONUSES[b];
      return pts ? `<div class="tt-line"><span class="tt-positivo">+${pts}</span><span>${b.replace(/_/g,' ')}</span></div>` : '';
    }).join('');
    const qpvPenalties = (p.penalties || []).map(pn => {
      const pts = PENALTIES[pn];
      return pts ? `<div class="tt-line"><span class="tt-negativo">${pts}</span><span>${pn.replace(/_/g,' ')}</span></div>` : '';
    }).join('');

    const msgWA = p.wa
      ? `https://wa.me/${p.wa}?text=${encodeURIComponent(`Hola, vi tu publicacion del ${p.title}. Me interesa un poodle ${p.size} color ${p.color}. ¿Sigue disponible?`)}`
      : '';
    const contactoHTML = p.wa
      ? `<a href="${msgWA}" target="_blank" class="btn-contacto">WhatsApp</a>`
      : `<a href="${p.url}" target="_blank" class="btn-contacto">Contactar</a>`;

    return `
      <div class="poodle-card ${cardClass}">
        <div class="poodle-header">
          <div class="poodle-rank ${rankClass}">${rank}</div>
          <div class="poodle-info">
            <div class="poodle-title">${escHtml(p.title)}</div>
            <div class="poodle-subtitle">${escHtml(p.subtitle)}</div>
            <div class="poodle-meta">
              <span class="meta-badge tipo-${p.type}">${tipoLabel}</span>
              <span class="meta-badge color-${p.color}">${colorLabel}</span>
              <span class="meta-badge tamano-${p.size}">${tamanoLabel}</span>
              <span class="meta-badge">${escHtml(p.location)}</span>
              <span class="${estadoClass}">${estadoLabel}</span>
            </div>
          </div>
          <div class="precio-box">
            ${precioHTML}
            <div class="qpv-area ${qpvClass}" onclick="toggleQPV('qt-${p.id}')">
              <div class="qpv-score">QPV ${p.qpv}</div>
              <div class="qpv-bar"><div class="qpv-fill" style="width:${Math.min(100, p.qpv)}%"></div></div>
              <div class="qpv-tooltip" id="qt-${p.id}">
                <div class="tt-line"><span>Base</span><span>${p.qpvBase || 0}</span></div>
                ${qpvBonuses}
                ${qpvPenalties}
                <div class="tt-line tt-total"><span>Total</span><span>${p.qpv}</span></div>
              </div>
            </div>
          </div>
        </div>
        ${verifHTML ? `<div class="badges-verif">${verifHTML}</div>` : ''}
        ${p.notes ? `<div class="notas">${escHtml(p.notes)}</div>` : ''}
        <div class="poodle-footer">
          ${contactoHTML}
          <a href="${escHtml(p.url)}" target="_blank" class="btn-link">Ver publicacion</a>
        </div>
      </div>`;
  }).join('\n    ');

  const stats = {
    total: poodles.length,
    adopcion: poodles.filter(p => p.type === 'adopcion').length,
    venta: poodles.filter(p => p.type === 'venta').length,
    minPrecio: poodles.filter(p => p.price > 0).length > 0
      ? Math.min(...poodles.filter(p => p.price > 0).map(p => p.price))
      : null,
    maxPrecio: poodles.filter(p => p.price > 0).length > 0
      ? Math.max(...poodles.filter(p => p.price > 0).map(p => p.price))
      : null,
    qpvAvg: poodles.length > 0 ? Math.round(poodles.reduce((s, p) => s + p.qpv, 0) / poodles.length) : 0
  };

  const lastUpdated = data.lastUpdated || 'desconocida';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Poodles Lima - Enanos y Miniaturas</title>
<meta name="description" content="Poodles enano (28-35cm) y miniatura (35-45cm) en Lima. Colores marron, apricot, rojo. Adopciones gratis y venta hasta S/ 4,000.">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff;color:#1a1a1a;line-height:1.6}
.container{max-width:960px;margin:0 auto;padding:20px}
header{background:linear-gradient(135deg,#f8f9fa,#fff);padding:32px 20px;border-bottom:1px solid #e9ecef;margin-bottom:20px;text-align:center}
header h1{font-size:1.6rem;font-weight:700;color:#212529;margin-bottom:4px}
header p{color:#6c757d;font-size:.9rem}
.ultima-act{display:inline-block;padding:3px 10px;background:#e9ecef;border-radius:12px;font-size:.72rem;color:#495057;margin-top:6px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:20px}
.stat-card{background:#fff;border:1px solid #e9ecef;border-radius:10px;padding:12px 8px;text-align:center;transition:transform .15s}
.stat-card:hover{transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.06)}
.stat-number{font-size:1.3rem;font-weight:700;color:#212529;display:block}
.stat-label{font-size:.68rem;color:#6c757d;text-transform:uppercase;letter-spacing:.4px;margin-top:2px}
.controls{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;align-items:center}
.filtros{display:flex;flex-wrap:wrap;gap:5px;flex:1}
.filtro-btn{background:#fff;border:1.5px solid #dee2e6;padding:6px 12px;border-radius:20px;font-size:.78rem;font-weight:500;cursor:pointer;transition:all .15s;color:#495057}
.filtro-btn:hover{border-color:#868e96}
.filtro-btn.activo{background:#212529;color:#fff;border-color:#212529}
.sort-group{display:flex;gap:4px}
.sort-btn{background:#f8f9fa;border:1px solid #dee2e6;padding:6px 10px;border-radius:6px;font-size:.72rem;cursor:pointer;color:#495057;transition:all .15s}
.sort-btn:hover{background:#e9ecef}
.sort-btn.activo{background:#212529;color:#fff;border-color:#212529}
.search-box{margin-bottom:16px}
.search-input{width:100%;padding:8px 14px;border:1.5px solid #dee2e6;border-radius:8px;font-size:.85rem;outline:none;transition:border-color .15s}
.search-input:focus{border-color:#212529}
.lista-poodles{display:flex;flex-direction:column;gap:10px}
.poodle-card{background:#fff;border:1px solid #e9ecef;border-radius:10px;padding:14px;transition:all .15s;position:relative}
.poodle-card:hover{border-color:#adb5bd;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.poodle-card.top1{border-left:4px solid #212529}
.poodle-card.top2{border-left:4px solid #495057}
.poodle-card.top3{border-left:4px solid #868e96}
.poodle-header{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px}
.poodle-rank{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;background:#f8f9fa;border-radius:50%;font-weight:700;color:#495057;font-size:.82rem;border:1px solid #e9ecef;flex-shrink:0}
.poodle-rank.top1{background:#212529;color:#fff;border-color:#212529}
.poodle-rank.top2{background:#495057;color:#fff;border-color:#495057}
.poodle-rank.top3{background:#868e96;color:#fff;border-color:#868e96}
.poodle-info{flex:1;min-width:0}
.poodle-title{font-size:.95rem;font-weight:600;color:#212529;margin-bottom:2px}
.poodle-subtitle{font-size:.78rem;color:#6c757d;margin-bottom:6px}
.poodle-meta{display:flex;flex-wrap:wrap;gap:4px}
.meta-badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;font-size:.68rem;font-weight:500;background:#f8f9fa;border:1px solid #e9ecef;color:#495057}
.meta-badge.color-marron{background:#f4e4d4;border-color:#d4a574;color:#6b4423}
.meta-badge.color-apricot{background:#ffe8d4;border-color:#f4a460;color:#a0522d}
.meta-badge.color-rojo{background:#ffd4d4;border-color:#e57373;color:#c62828}
.meta-badge.tipo-adopcion{background:#d4edda;border-color:#81c784;color:#2e7d32;font-weight:600}
.meta-badge.tipo-venta{background:#e3f2fd;border-color:#64b5f6;color:#1565c0}
.meta-badge.tamano-enano{background:#fff3e0;border-color:#ffb74d;color:#e65100}
.meta-badge.tamano-miniatura{background:#fce4ec;border-color:#f06292;color:#ad1457}
.precio-box{text-align:right;flex-shrink:0;min-width:80px}
.precio-valor{font-size:1.1rem;font-weight:700;color:#212529;display:block}
.precio-gratis{color:#2e7d32;font-size:1.2rem}
.qpv-area{cursor:pointer;position:relative}
.qpv-score{font-size:.7rem;color:#6c757d;margin-top:1px}
.qpv-bar{height:5px;background:#e9ecef;border-radius:3px;margin-top:3px;overflow:hidden;width:70px;margin-left:auto}
.qpv-fill{height:100%;border-radius:3px;transition:width .3s}
.qpv-excelente .qpv-fill{background:linear-gradient(90deg,#2e7d32,#66bb6a)}
.qpv-bueno .qpv-fill{background:linear-gradient(90deg,#1565c0,#42a5f5)}
.qpv-justo .qpv-fill{background:linear-gradient(90deg,#e65100,#ff9800)}
.qpv-alto .qpv-fill{background:linear-gradient(90deg,#c62828,#ef5350)}
.qpv-tooltip{display:none;position:absolute;top:100%;right:0;z-index:10;background:#212529;color:#fff;border-radius:8px;padding:10px 14px;font-size:.72rem;width:200px;margin-top:4px;text-align:left;line-height:1.5;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.qpv-tooltip.show{display:block}
.qpv-tooltip .tt-line{display:flex;justify-content:space-between;gap:8px;padding:1px 0}
.qpv-tooltip .tt-total{font-weight:700;border-top:1px solid rgba(255,255,255,.2);margin-top:4px;padding-top:4px}
.qpv-tooltip .tt-positivo{color:#81c784}
.qpv-tooltip .tt-negativo{color:#ef5350}
.poodle-footer{display:flex;gap:6px;margin-top:8px;align-items:center;flex-wrap:wrap}
.btn-contacto{display:inline-flex;align-items:center;gap:5px;padding:7px 12px;background:#25d366;color:#fff;text-decoration:none;border-radius:7px;font-size:.82rem;font-weight:600;transition:all .15s;flex:1;justify-content:center;min-width:120px}
.btn-contacto:hover{background:#1da851;transform:translateY(-1px)}
.btn-link{display:inline-flex;align-items:center;gap:4px;padding:7px 10px;background:#f8f9fa;color:#495057;text-decoration:none;border-radius:7px;font-size:.78rem;border:1px solid #e9ecef;transition:all .15s}
.btn-link:hover{background:#e9ecef}
.badges-verif{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
.verif-badge{font-size:.68rem;padding:2px 7px;border-radius:8px;background:#fff3cd;color:#856404;border:1px solid #ffeaa7}
.verif-badge.pedigree{background:#d1ecf1;color:#0c5460;border-color:#bee5eb}
.verif-badge.vacunas{background:#d4edda;color:#155724;border-color:#c3e6cb}
.verif-badge.garantia{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.verif-badge.criadero{background:#cce5ff;color:#004085;border-color:#b8daff}
.estado-badge{font-size:.68rem;padding:2px 7px;border-radius:8px;font-weight:600}
.estado-disponible{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
.estado-consultar{background:#fff3cd;color:#856404;border:1px solid #ffeaa7}
.notas{font-size:.78rem;color:#6c757d;margin-top:6px;font-style:italic}
.seccion-criadores{margin-top:30px}
.seccion-criadores h2{font-size:1.1rem;color:#212529;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e9ecef}
.criadores-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.criador-card{background:#f8f9fa;border:1px solid #e9ecef;border-radius:10px;padding:14px}
.criador-card h3{font-size:.9rem;color:#212529;margin-bottom:4px}
.criador-card p{font-size:.78rem;color:#6c757d;margin-bottom:6px}
.criador-card .criador-meta{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.criador-card .criador-tag{font-size:.68rem;padding:2px 8px;border-radius:8px;background:#e9ecef;color:#495057}
.criador-card .criador-tag.confianza{background:#d4edda;color:#2e7d32;font-weight:600}
.criador-card a{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#25d366;color:#fff;text-decoration:none;border-radius:7px;font-size:.78rem;font-weight:600;transition:all .15s}
.criador-card a:hover{background:#1da851}
.share-btn{display:block;margin:24px auto;padding:12px 24px;background:#212529;color:#fff;border:none;border-radius:10px;font-size:.9rem;font-weight:600;cursor:pointer;transition:all .15s;width:100%;max-width:280px}
.share-btn:hover{background:#000;transform:translateY(-1px)}
.consejos{background:#fff9e6;border:1px solid #ffe082;border-radius:10px;padding:16px;margin-top:24px}
.consejos h3{color:#f57c00;font-size:.9rem;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.consejos ul{list-style:none;padding:0}
.consejos li{padding:5px 0;font-size:.8rem;color:#5d4037;padding-left:20px;position:relative}
.consejos li::before{content:"\\26A0";position:absolute;left:0;font-size:.75rem}
.sin-resultados{text-align:center;padding:40px 20px;color:#adb5bd;font-size:.9rem}
footer{text-align:center;padding:24px 20px;color:#adb5bd;font-size:.75rem;border-top:1px solid #e9ecef;margin-top:30px}
footer a{color:#6c757d;text-decoration:none}
footer a:hover{text-decoration:underline}
.contact-area{position:relative;display:inline-flex;cursor:pointer}
.contact-badge{font-size:.68rem;padding:2px 9px;border-radius:8px;font-weight:600;border:1px solid;transition:all .12s;white-space:nowrap}
.contact-badge.pendiente{background:#f8f9fa;color:#6c757d;border-color:#dee2e6}
.contact-badge.pendiente:hover{background:#e9ecef}
.contact-badge.contactado{background:#cce5ff;color:#004085;border-color:#b8daff}
.contact-badge.respondio{background:#d4edda;color:#155724;border-color:#c3e6cb}
.contact-badge.negociando{background:#fff3cd;color:#856404;border-color:#ffeaa7}
.contact-badge.no_disponible{background:#f8d7da;color:#721c24;border-color:#f5c6cb}
.contact-menu{display:none;position:absolute;top:100%;left:0;z-index:10;background:#fff;border:1px solid #dee2e6;border-radius:8px;padding:4px;margin-top:4px;box-shadow:0 4px 12px rgba(0,0,0,.1);min-width:145px}
.contact-menu.show{display:block}
.contact-menu-item{padding:5px 10px;font-size:.74rem;cursor:pointer;border-radius:5px;color:#495057;transition:background .1s;white-space:nowrap}
.contact-menu-item:hover{background:#f8f9fa}
.contact-menu-item.activo{font-weight:600;background:#e9ecef}
@media(max-width:600px){
  header h1{font-size:1.3rem}
  .poodle-header{flex-direction:column}
  .precio-box{text-align:left;margin-top:4px;width:100%;display:flex;align-items:center;gap:12px}
  .qpv-bar{margin-left:0}
  .qpv-tooltip{right:auto;left:0}
  .stats{grid-template-columns:repeat(2,1fr)}
  .stat-number{font-size:1.1rem}
  .poodle-card{padding:12px}
  .controls{flex-direction:column;align-items:stretch}
  .sort-group{justify-content:center}
  .criadores-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>
<header>
  <div class="container">
    <h1>Poodles Enanos y Miniaturas en Lima</h1>
    <p>Ranking QPV: calidad-precio de cada anuncio</p>
    <span class="ultima-act">Actualizado ${lastUpdated}</span>
  </div>
</header>
<div class="container">
  <div class="stats">
    <div class="stat-card"><span class="stat-number" id="stat-total">${stats.total}</span><div class="stat-label">Total</div></div>
    <div class="stat-card"><span class="stat-number" id="stat-adopcion">${stats.adopcion}</span><div class="stat-label">Adopciones</div></div>
    <div class="stat-card"><span class="stat-number" id="stat-venta">${stats.venta}</span><div class="stat-label">En Venta</div></div>
    <div class="stat-card"><span class="stat-number" id="stat-precio-min">${stats.minPrecio ? 'S/ '+stats.minPrecio.toLocaleString() : '\u2014'}</span><div class="stat-label">Min. Venta</div></div>
    <div class="stat-card"><span class="stat-number" id="stat-precio-max">${stats.maxPrecio ? 'S/ '+stats.maxPrecio.toLocaleString() : '\u2014'}</span><div class="stat-label">Max. Venta</div></div>
    <div class="stat-card"><span class="stat-number" id="stat-qpv-avg">${stats.qpvAvg}</span><div class="stat-label">QPV Prom.</div></div>
  </div>
  <div class="controls">
    <div class="filtros" id="filtros">
      <button class="filtro-btn activo" data-filtro="todos">Todos</button>
      <button class="filtro-btn" data-filtro="adopcion">Adopcion</button>
      <button class="filtro-btn" data-filtro="venta">Venta</button>
      <button class="filtro-btn" data-filtro="marron">Marron</button>
      <button class="filtro-btn" data-filtro="apricot">Apricot</button>
      <button class="filtro-btn" data-filtro="rojo">Rojo</button>
      <button class="filtro-btn" data-filtro="enano">Enano</button>
      <button class="filtro-btn" data-filtro="miniatura">Miniatura</button>
    </div>
    <div class="sort-group">
      <button class="sort-btn activo" data-sort="qpv">QPV</button>
      <button class="sort-btn" data-sort="precio-asc">S/</button>
      <button class="sort-btn" data-sort="precio-desc">S/</button>
    </div>
  </div>
  <div class="search-box">
    <input class="search-input" id="search-input" type="text" placeholder="Buscar por nombre, criador, ubicacion..." autocomplete="off">
  </div>
  <div class="controls" style="margin-top:-8px">
    <div class="filtros" id="filtros-contacto">
      <button class="filtro-btn activo" data-cfiltro="todos">Todos</button>
      <button class="filtro-btn" data-cfiltro="pendiente">Pendiente</button>
      <button class="filtro-btn" data-cfiltro="contactado">Contactado</button>
      <button class="filtro-btn" data-cfiltro="respondio">Respondio</button>
      <button class="filtro-btn" data-cfiltro="negociando">Negociando</button>
      <button class="filtro-btn" data-cfiltro="no_disponible">No disponible</button>
    </div>
  </div>
  <div class="lista-poodles" id="lista-poodles">
    ${cardsHTML}
  </div>
  <button class="share-btn" onclick="compartir()">Compartir esta lista</button>
  <div class="seccion-criadores">
    <h2>Criadores verificados en Lima</h2>
    <div class="criadores-grid">
      <div class="criador-card">
        <h3>Puppy Toy Peru</h3>
        <p>Los Olivos · 10+ anos de experiencia · Pedigree · Garantia de salud</p>
        <div class="criador-meta"><span class="criador-tag confianza">Confianza</span><span class="criador-tag">Enano/Toy</span><span class="criador-tag">Todos los colores</span></div>
        <a href="https://wa.me/51920688338?text=Hola%2C%20vi%20el%20dashboard%20de%20Poodles%20Lima.%20%C2%BFTienen%20poodle%20enano%20o%20miniatura%20disponible%3F" target="_blank">WhatsApp: +51 920 688 338</a>
      </div>
      <div class="criador-card">
        <h3>Premium Kennel</h3>
        <p>Miraflores · Certificado · Delivery gratis · Pedigree</p>
        <div class="criador-meta"><span class="criador-tag confianza">Confianza</span><span class="criador-tag">Apricot/Rojo</span><span class="criador-tag">Delivery gratis</span></div>
        <a href="https://wa.me/51934737929?text=Hola%2C%20vi%20el%20dashboard%20de%20Poodles%20Lima.%20%C2%BFTienen%20poodle%20enano%20o%20miniatura%20disponible%3F" target="_blank">WhatsApp: +51 934 737 929</a>
      </div>
      <div class="criador-card">
        <h3>Lima Onepets</h3>
        <p>San Martin de Porres · Videollamada previa · Apricot</p>
        <div class="criador-meta"><span class="criador-tag confianza">Confianza</span><span class="criador-tag">Apricot</span><span class="criador-tag">Videollamada</span></div>
        <a href="https://wa.me/51989886841?text=Hola%2C%20vi%20el%20dashboard%20de%20Poodles%20Lima.%20%C2%BFTienen%20poodle%20enano%20o%20miniatura%20disponible%3F" target="_blank">WhatsApp: +51 989 886 841</a>
      </div>
    </div>
    <p style="margin-top:12px;font-size:.8rem;color:#6c757d;text-align:center;">
      Algunos criadores tambien ofrecen Mini Toy (&lt;28cm). Pregunta si tienen <strong>Enano (28-35cm)</strong> o <strong>Miniatura (35-45cm)</strong> disponible.
    </p>
  </div>
  <div class="consejos">
    <h3>Consejos antes de contactar</h3>
    <ul>
      <li>Pide siempre videollamada previa para ver al cachorro en vivo.</li>
      <li>Exige certificado de pedigree del Kennel Club Peruano (KCP) si aplica.</li>
      <li>Verifica carnet de vacunas al dia y desparasitacion.</li>
      <li>Nunca pagues por adelantado sin ver al perro fisicamente.</li>
      <li>Pregunta por la garantia de salud (minimo 30 dias).</li>
      <li>El tamano adulto de un enano es 28-35cm, miniatura 35-45cm. Confirma con el criador.</li>
      <li>Los poodles son hipoalergenicos, pero el color puede aclararse con la edad.</li>
      <li>En adopciones gratuitas, comprometete a esterilizar si te lo piden.</li>
    </ul>
  </div>
</div>
<footer>
  <p>Datos recopilados de fuentes reales verificadas en Lima, Peru</p>
  <p><a href="https://github.com/noamlv/poodle-lima" target="_blank">Dashboard en GitHub</a></p>
</footer>
<script>
const poodlesData = ${JSON.stringify(poodles.map(p => ({
  id: p.id, title: p.title, subtitle: p.subtitle, type: p.type,
  price: p.price, color: p.color, size: p.size, location: p.location,
  contact: p.contact, wa: p.wa, url: p.url, notes: p.notes,
  badges: p.badges, status: p.status, qpv: p.qpv, qpvBase: p.qpvBase,
  bonuses: p.bonuses, penalties: p.penalties, contactStatus: p.contactStatus || 'pendiente'
})))};

const CS_LABELS = { pendiente: 'Pendiente', contactado: 'Contactado', respondio: 'Respondio', negociando: 'Negociando', no_disponible: 'No disponible' };
const CS_KEYS = Object.keys(CS_LABELS);

let contactStatuses = {};
function loadContactStatuses() {
  try { const s = localStorage.getItem('poodleCS'); if (s) contactStatuses = JSON.parse(s); } catch(e) {}
  poodlesData.forEach(p => { if (contactStatuses[p.id]) p.contactStatus = contactStatuses[p.id]; else { p.contactStatus = 'pendiente'; contactStatuses[p.id] = 'pendiente'; } });
}
function saveContactStatuses() {
  try { localStorage.setItem('poodleCS', JSON.stringify(contactStatuses)); } catch(e) {}
}
loadContactStatuses();

let currentSort = 'qpv';
let currentFiltro = 'todos';
let currentCFiltro = 'todos';
let searchTerm = '';

const BONUSES = ${JSON.stringify(BONUSES)};
const PENALTIES = ${JSON.stringify(PENALTIES)};

function getQPVClass(qpv) { if(qpv>=95)return'qpv-excelente';if(qpv>=80)return'qpv-bueno';if(qpv>=70)return'qpv-justo';return'qpv-alto'; }

function render() {
  const lista = document.getElementById('lista-poodles');
  let filtered = poodlesData.filter(p => {
    if (currentFiltro === 'adopcion' || currentFiltro === 'venta') return p.type === currentFiltro;
    if (['marron','apricot','rojo'].includes(currentFiltro)) return p.color === currentFiltro;
    if (['enano','miniatura'].includes(currentFiltro)) return p.size === currentFiltro;
    return true;
  }).filter(p => {
    if (currentCFiltro === 'todos') return true;
    return p.contactStatus === currentCFiltro;
  });
  if (searchTerm) {
    const t = searchTerm.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(t) || p.subtitle.toLowerCase().includes(t) || p.location.toLowerCase().includes(t) || p.contact.toLowerCase().includes(t));
  }
  filtered.sort((a, b) => {
    if (currentSort === 'qpv') return (b.qpv||0) - (a.qpv||0);
    if (currentSort === 'precio-asc') return (a.price||999999) - (b.price||999999);
    if (currentSort === 'precio-desc') return (b.price||0) - (a.price||0);
    return 0;
  });
  if (filtered.length === 0) {
    lista.innerHTML = '<div class="sin-resultados">No hay resultados con estos filtros</div>';
    updateStats(filtered);
    return;
  }
  lista.innerHTML = filtered.map((p, i) => {
    const rank = i + 1;
    const rankClass = rank===1?'top1':rank===2?'top2':rank===3?'top3':'';
    const cardClass = rank<=3?'top3 '+rankClass:'';
    const qpvClass = getQPVClass(p.qpv);
    const precioHTML = p.price===0?'<span class="precio-valor precio-gratis">GRATIS</span>':'<span class="precio-valor">S/ '+p.price.toLocaleString()+'</span>';
    const colorLabel = {marron:'Marron',apricot:'Apricot',rojo:'Rojo'}[p.color]||p.color;
    const tamanoLabel = {enano:'Enano 28-35cm',miniatura:'Miniatura 35-45cm'}[p.size]||p.size;
    const tipoLabel = p.type==='adopcion'?'Adopcion':'Venta';
    const estadoLabel = p.status==='disponible'?'Disponible':'Consultar';
    const estadoClass = p.status==='disponible'?'estado-disponible':'estado-consultar';
    const badgeLabels = {criadero_certificado:'Criadero Certificado',criadero_oficial:'Oficial',pedigree:'Pedigree',vacunas:'Vacunas',garantia:'Garantia',garantia_salud:'Garantia Salud',esterilizado:'Esterilizado',refugio_oficial:'Refugio',padres_presentes:'Padres presentes',lima_verificado:'Lima',publicado_reciente:'Reciente',caso_especial:'Caso especial',criadero_verificado:'Criadero Verificado'};
    const badgeClass = v => {if(['pedigree','criadero_certificado','criadero_verificado','criadero_oficial'].includes(v))return'pedigree';if(['vacunas','esterilizado','refugio_oficial'].includes(v))return'vacunas';if(['garantia','garantia_salud'].includes(v))return'garantia';return'';};
    const verifHTML = (p.badges||[]).map(v => '<span class="verif-badge '+badgeClass(v)+'">'+(badgeLabels[v]||v)+'</span>').join('');
    const qpvBonuses = (p.bonuses||[]).map(b => BONUSES[b] ? '<div class="tt-line"><span class="tt-positivo">+'+BONUSES[b]+'</span><span>'+b.replace(/_/g,' ')+'</span></div>' : '').join('');
    const qpvPenalties = (p.penalties||[]).map(pn => PENALTIES[pn] ? '<div class="tt-line"><span class="tt-negativo">'+PENALTIES[pn]+'</span><span>'+pn.replace(/_/g,' ')+'</span></div>' : '').join('');
    const msgWA = p.wa ? 'https://wa.me/'+p.wa+'?text='+encodeURIComponent('Hola, vi tu publicacion del '+p.title+'. Me interesa.') : '';
    const contactoHTML = p.wa ? '<a href="'+msgWA+'" target="_blank" class="btn-contacto">WhatsApp</a>' : '<a href="'+p.url+'" target="_blank" class="btn-contacto">Contactar</a>';
    return '<div class="poodle-card '+cardClass+'"><div class="poodle-header"><div class="poodle-rank '+rankClass+'">'+rank+'</div><div class="poodle-info"><div class="poodle-title">'+escHtml(p.title)+'</div><div class="poodle-subtitle">'+escHtml(p.subtitle)+'</div><div class="poodle-meta"><span class="meta-badge tipo-'+p.type+'">'+tipoLabel+'</span><span class="meta-badge color-'+p.color+'">'+colorLabel+'</span><span class="meta-badge tamano-'+p.size+'">'+tamanoLabel+'</span><span class="meta-badge">'+escHtml(p.location)+'</span><span class="'+estadoClass+'">'+estadoLabel+'</span></div></div><div class="precio-box">'+precioHTML+'<div class="qpv-area '+qpvClass+'" onclick="toggleQPV(\'qt-'+p.id+'\')"><div class="qpv-score">QPV '+p.qpv+'</div><div class="qpv-bar"><div class="qpv-fill" style="width:'+Math.min(100,p.qpv)+'%"></div></div><div class="qpv-tooltip" id="qt-'+p.id+'"><div class="tt-line"><span>Base</span><span>'+(p.qpvBase||0)+'</span></div>'+qpvBonuses+qpvPenalties+'<div class="tt-line tt-total"><span>Total</span><span>'+p.qpv+'</span></div></div></div></div></div>'+(verifHTML?'<div class="badges-verif">'+verifHTML+'</div>':'')+'<div style="display:flex;align-items:center;gap:6px;margin-top:6px"><span style="font-size:.68rem;color:#6c757d">Seguimiento:</span><div class="contact-area" onclick="event.stopPropagation();toggleContactMenu(\'cm-'+p.id+'\')"><span class="contact-badge '+p.contactStatus+'">'+(CS_LABELS[p.contactStatus]||'Pendiente')+'</span><div class="contact-menu" id="cm-'+p.id+'">'+CS_KEYS.map(function(kk){return '<div class="contact-menu-item'+(p.contactStatus===kk?' activo':'')+'" onclick="event.stopPropagation();setContact('+p.id+',\''+kk+'\')">'+(CS_LABELS[kk])+'</div>'}).join('')+'</div></div></div>'+(p.notes?'<div class="notas">'+escHtml(p.notes)+'</div>':'')+'<div class="poodle-footer">'+contactoHTML+'<a href="'+escHtml(p.url)+'" target="_blank" class="btn-link">Ver publicacion</a></div></div>';
  }).join('');
  updateStats(filtered);
}

function escHtml(s) { const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }

function toggleContactMenu(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const was = el.classList.contains('show');
  document.querySelectorAll('.contact-menu.show').forEach(e => e.classList.remove('show'));
  if (!was) el.classList.add('show');
}

function setContact(id, status) {
  contactStatuses[id] = status;
  const p = poodlesData.find(x => x.id === id);
  if (p) p.contactStatus = status;
  saveContactStatuses();
  document.querySelectorAll('.contact-menu.show').forEach(e => e.classList.remove('show'));
  render();
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.qpv-area')) document.querySelectorAll('.qpv-tooltip.show').forEach(el => el.classList.remove('show'));
  if (!e.target.closest('.contact-area')) document.querySelectorAll('.contact-menu.show').forEach(el => el.classList.remove('show'));
});

function toggleQPV(id) {
  const el = document.getElementById(id);
  if(!el)return;
  const was = el.classList.contains('show');
  document.querySelectorAll('.qpv-tooltip.show').forEach(e=>e.classList.remove('show'));
  if(!was)el.classList.add('show');
}



function updateStats(arr) {
  document.getElementById('stat-total').textContent = arr.length;
  document.getElementById('stat-adopcion').textContent = arr.filter(p=>p.type==='adopcion').length;
  document.getElementById('stat-venta').textContent = arr.filter(p=>p.type==='venta').length;
  const ventas = arr.filter(p=>p.price>0);
  document.getElementById('stat-precio-min').textContent = ventas.length>0?'S/ '+Math.min(...ventas.map(p=>p.price)).toLocaleString():'\u2014';
  document.getElementById('stat-precio-max').textContent = ventas.length>0?'S/ '+Math.max(...ventas.map(p=>p.price)).toLocaleString():'\u2014';
  const avg = arr.length>0?Math.round(arr.reduce((s,p)=>s+p.qpv,0)/arr.length):0;
  document.getElementById('stat-qpv-avg').textContent = arr.length>0?avg:'\u2014';
}

document.querySelectorAll('#filtros .filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filtros .filtro-btn').forEach(b=>b.classList.remove('activo'));
    btn.classList.add('activo');
    currentFiltro = btn.dataset.filtro;
    render();
  });
});
document.querySelectorAll('#filtros-contacto .filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filtros-contacto .filtro-btn').forEach(b=>b.classList.remove('activo'));
    btn.classList.add('activo');
    currentCFiltro = btn.dataset.cfiltro;
    render();
  });
});
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b=>b.classList.remove('activo'));
    btn.classList.add('activo');
    currentSort = btn.dataset.sort;
    render();
  });
});
document.getElementById('search-input').addEventListener('input', e => { searchTerm = e.target.value; render(); });

function compartir() {
  const gratis = poodlesData.filter(p=>p.price===0).length;
  const minVenta = Math.min(...poodlesData.filter(p=>p.price>0).map(p=>p.price));
  const d = { title:'Poodles Enanos y Miniaturas en Lima', text:poodlesData.length+' poodles en Lima. '+gratis+' en adopcion gratis, desde S/ '+minVenta.toLocaleString()+' en venta.', url:window.location.href };
  if(navigator.share){navigator.share(d).catch(()=>{});}else{navigator.clipboard.writeText(d.title+'\\n'+d.text+'\\n'+d.url);alert('Link copiado al portapapeles.');}
}

render();
</script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`HTML generado: ${OUTPUT_FILE}`);
  console.log(`Poodles: ${poodles.length} | Actualizado: ${lastUpdated}`);
}

if (require.main === module) generate();
module.exports = { generate };
