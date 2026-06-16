# Poodle Lima - Dashboard de Poodles en Lima

Dashboard web de poodles enanos (28-35cm) y miniatura (35-45cm) en Lima, Peru.
Colores marron, apricot y rojo. Adopciones gratis y venta hasta S/ 4,000.

**Dashboard online:** https://noamlv.github.io/poodle-lima/poodles.html

## Arquitectura

### Flujo de actualizacion diaria

```
Scrapers (8am cada dia) → data/poodles.json → scripts/build.js → poodles.html → GitHub Pages
                                ↓
                      scripts/check-prices.js
                                ↓
                     Issue si hay BAJA de precio
```

### Archivos

| Archivo | Proposito |
|---------|-----------|
| `data/poodles.json` | Base de datos de poodles (editar aqui para agregar/quitar) |
| `data/history.json` | Historial de cambios de precio |
| `scripts/build.js` | Genera `poodles.html` desde `data/poodles.json` |
| `scripts/scrape.js` | Scraper de WUF, MercadoLibre y criadores |
| `scripts/check-prices.js` | Detecta bajas y subidas de precio |
| `scripts/utils.js` | Constantes QPV y funciones compartidas |
| `poodles.html` | Dashboard generado (NO editar manualmente) |

## GitHub Actions

| Workflow | Schedule | Que hace |
|----------|----------|----------|
| `daily-update.yml` | 8am cada dia | Scrapea fuentes, verifica precios, genera HTML, deploy a Pages. Crea Issue si hay bajas. |
| `deploy-pages.yml` | Al hacer push | Genera HTML desde JSON y deploy a Pages |
| `update-data.yml` | Manual | Formulario para agregar un poodle nuevo |
| `check-links.yml` | Cada lunes | Verifica que los enlaces no esten rotos |

## Como actualizar datos

### Opcion 1: Editar data/poodles.json (recomendado)
Agregar o modificar objetos en el array `poodles`. Luego ejecutar:

```bash
npm run build
```

Esto regenera `poodles.html` automaticamente.

### Opcion 2: GitHub Actions
Ir a Actions > "Agregar poodle manualmente" > Run workflow > llenar formulario.

### Opcion 3: Scraping automatico
El scraper corre cada dia a las 8am (hora Peru). Revisa:

**Adopciones:**
- **WUF Peru** (wuf.pe/adoptawuf) - ONG oficial de Lima
- **Adopta Lima** (adoptalima.org) - portal municipal

**Ventas:**
- **MercadoLibre Peru** (3 busquedas: poodle miniatura, poodle enano, cachorros poodle)
- **OLX Peru** (olx.pe) - clasificados
- **Criadores:** Puppy Toy Peru, Premium Kennel, Lima Onepets, Happy Pets, Central Pets Peru

### Opcion 4: Sugerir desde redes sociales
Si encuentras un poodle en Facebook, Instagram o TikTok:
1. Ve a Issues > "Sugerir un poodle"
2. Llena el formulario con el link y datos
3. Se agregara manualmente al dashboard

## Tracking de precios

El script `check-prices.js` visita las URLs de cada poodle en venta y compara el precio actual con el registrado. Si encuentra una **baja**, crea automaticamente un Issue en GitHub.

Para ejecutar manualmente:
```bash
npm run check-prices
```

## Algoritmo QPV

| Tipo | Base |
|------|------|
| Adopcion gratuita | 100 |
| Venta S/ 1,800-2,500 | 90 |
| Venta S/ 2,500-2,800 | 85 |
| Venta S/ 3,000-3,500 | 75 |
| Venta S/ 3,800-4,000 | 70 |

Bonificaciones: +5 color prioritario, +5 tamano ideal, +10 criador verificado, +5 vacunas, +5 pedigree, +5 garantia salud

Penalizaciones: -10 sin WhatsApp, -10 sin datos salud, -20 ubicacion no verificada, -15 precio >S/3500 sin pedigree, -10 enlace generico

## Criadores verificados

| Criador | WhatsApp | Ubicacion |
|---------|----------|-----------|
| Puppy Toy Peru | [+51 920 688 338](https://wa.me/51920688338) | Los Olivos |
| Premium Kennel | [+51 934 737 929](https://wa.me/51934737929) | Miraflores |
| Lima Onepets | [+51 989 886 841](https://wa.me/51989886841) | San Martin de Porres |

## Requisitos locales

- Node.js 18+
```bash
npm install
npm run build    # genera poodles.html
npm run scrape   # ejecuta scraping
npm run check-prices  # verifica precios
```
