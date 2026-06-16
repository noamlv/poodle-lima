# 🐩 Proyecto Poodle Lima - Documentación Completa

## 📋 Contexto del Proyecto

**Usuario:** Noam López  
**Ubicación:** Lima, Perú  
**Objetivo:** Encontrar poodles miniatura (25-40 cm) en adopción gratuita o venta económica (hasta S/ 4,000)  
**Fecha de inicio:** Junio 2026  
**Estado actual:** Dashboard funcional con 13 poodles reales verificados

---

## 🎯 Criterios de Búsqueda (ACTUALIZADOS - Junio 2026)

### ✅ PERMITIDO:
- **Ubicación:** Lima, Perú (distritos verificados: Surco, Miraflores, San Borja, Los Olivos, SJL, SMP, Lince, etc.)
- **Tamaño:** 
  - Enano: 28-35 cm de altura
  - Miniatura: 35-45 cm de altura
  - Rango ideal: **25-40 cm** (usuario prefiere este rango específico)
- **Colores:** 
  - 🟤 Marrón / Chocolate
  - 🟠 Apricot
  - 🔴 Rojo / Pimentón
- **Tipo:** Adopción gratuita O venta hasta S/ 4,000
- **Edad:** Cachorros preferidos (2-7 meses)

### ❌ PROHIBIDO:
- **Colores:** Blanco, crema, negro (eliminados por preferencia del usuario)
- **Tamaños:** Toy estándar (<28 cm, muy pequeño para el usuario)
- **Ubicaciones:** España, Ecuador, Colombia, cualquier lugar fuera de Lima
- **Precios:** Mayor a S/ 4,000
- **Fuentes inestables:** Facebook (enlaces rotos), Petopic.com (es de España)

---

## 📊 Algoritmo QPV (Quality-Price Value)

### Fórmula de cálculo:
```
QPV = Base + Bonificaciones - Penalizaciones
```

### Puntuación base:
| Tipo | Puntuación Base |
|------|----------------|
| Adopción gratuita | 100 puntos |
| Venta S/ 1,800-2,200 | 90 puntos |
| Venta S/ 2,500-2,800 | 85 puntos |
| Venta S/ 3,000-3,500 | 75 puntos |
| Venta S/ 3,800-4,000 | 70 puntos |
| Venta > S/ 4,000 | 0 puntos (descartado) |

### Bonificaciones:
| Factor | Puntos Extra |
|--------|--------------|
| Color prioritario (marrón/apricot/rojo) | +5 |
| Tamaño ideal (25-40 cm) | +5 |
| Criador verificado (Puppy Toy Perú, Premium Kennel, Lima Onepets) | +10 |
| Vacunas al día documentadas | +5 |
| Pedigree certificado | +5 |
| Garantía de salud | +5 |

### Penalizaciones:
| Factor | Puntos Restados |
|--------|-----------------|
| Sin datos de salud | -10 |
| Ubicación no verificada | -20 |
| Precio > S/ 3,500 sin pedigree | -15 |
| Enlace genérico (no directo al anuncio) | -10 |

### Interpretación del QPV:
- **100-115:** 🥇 Excelente oportunidad (adopciones gratis verificadas)
- **90-99:** 🥈 Muy buen precio-valor
- **80-89:** 🥉 Precio justo con buenas condiciones
- **70-79:** ⚠️ Precio alto pero aceptable si tiene garantías
- **<70:** ❌ No recomendado

---

## 🕵️ Fuentes de Búsqueda

### ✅ Fuentes VERIFICADAS y funcionales:

#### 1. **Criadores con WhatsApp directo:**
- **Puppy Toy Perú** (Los Olivos)
  - WhatsApp: +51 920 688 338
  - Web: puppytoyperuoficial.com
  - Especialidad: Toy y Enano, colores variados
  - Confianza: ⭐⭐⭐⭐⭐ (10+ años, pedigree, garantía)
  
- **Premium Kennel** (Miraflores)
  - WhatsApp: +51 934 737 929
  - Web: cachorrosperu.pe
  - Especialidad: Apricot y Rojo
  - Confianza: ⭐⭐⭐⭐⭐ (certificado, delivery gratis)
  
- **Lima Onepets** (San Martín de Porres)
  - WhatsApp: +51 989 886 841
  - Web: limaonepets.com
  - Especialidad: Apricot
  - Confianza: ⭐⭐⭐⭐ (videollamada previa)

#### 2. **Portales de adopción:**
- **WUF Perú** (wuf.pe/adoptawuf)
  - ONG oficial de Lima
  - Adopciones gratuitas verificadas
  
- **Adopta Lima**
  - Portal municipal
  - Eventos presenciales mensuales

#### 3. **Marketplaces:**
- **MercadoLibre Perú**
  - Filtrar por: "poodle mini lima", ordenar por precio ascendente
  - Verificar ubicación y vendedor antes de incluir

### ❌ Fuentes DESCARTADAS (con razón):

| Fuente | Razón del descarte |
|--------|-------------------|
| **Petopic.com** | Es de España (Málaga), no Lima. Aunque tiene anuncios de poodles, la geolocalización es incorrecta. |
| **Facebook Groups** | Enlaces inestables, requieren login, scraping bloqueado, posts antiguos sin actualizar. |
| **Instagram scraping** | API restringida, no se puede extraer datos estructurados sin acceso manual. |
| **TikTok** | Solo videos, sin datos de contacto estructurados. |

---

## 🛠️ Lecciones Aprendidas (CRÍTICO para el próximo copiloto)

### 1. **Google Drive NO permite archivos ejecutables**
- **Problema:** Al crear archivos `.command` o `.sh` en Google Drive, automáticamente pierden permisos de ejecución.
- **Solución:** 
  - Opción A: Crear apps nativas de macOS con `osacompile` (funciona en Escritorio)
  - Opción B: Mantener solo HTML estático en Drive (recomendado)
  - Opción C: Trabajar en carpeta local (~/Desktop o ~/Documents)

### 2. **Facebook scraping NO funciona**
- **Problema:** Facebook bloquea scraping automatizado, enlaces cambian, requiere login.
- **Solución:** Usar solo portales abiertos (WUF, Adopta) o datos verificados manualmente.

### 3. **Las fotos de perros en anuncios NO son reales**
- **Problema:** Muchos vendedores usan fotos de internet, no del perro real.
- **Solución:** Dashboard sin fotos, solo datos textuales verificados y enlaces directos a WhatsApp.

### 4. **Enlaces deben ir DIRECTO al contacto**
- **Problema:** Enlaces a homepages genéricas (ej: puppytoyperu.com) no llevan al anuncio específico.
- **Solución:** Usar WhatsApp con mensaje prellenado:
  ```
  https://wa.me/51920688338?text=Hola,%20vi%20su%20Poodle%20Mini%20Apricot%20a%20S/2500.%20¿Sigue%20disponible?
  ```

### 5. **Validación geográfica es CRÍTICA**
- **Problema:** Portales como Petopic muestran anuncios de España/Ecuador como si fueran de Lima.
- **Solución:** Filtrar por:
  - Palabras clave de distritos de Lima
  - Código de país +51
  - Verificación manual de ubicación

### 6. **El usuario prefiere simplicidad**
- **Problema:** Scripts Python complejos con múltiples archivos confunden al usuario.
- **Solución:** Un solo archivo HTML estático con todo incluido (CSS + JS + datos).

---

## 📁 Estado Actual de Archivos

### Carpeta: `/Users/noam/Library/CloudStorage/GoogleDrive-lopeznoam@gmail.com/Mi unidad/Poodle/`

```
📁 Poodle/
├── 📄 poodles.html      ← Dashboard final (13 poodles reales, criterios actualizados)
└── 📄 README.md         ← Este archivo (documentación completa)
```

**Todos los demás archivos fueron eliminados** (scripts Python antiguos, HTMLs duplicados, apps de macOS, etc.)

---

## 🎨 Estructura del Dashboard (poodles.html)

### Características implementadas:
- ✅ Diseño blanco minimalista
- ✅ 100% responsive (mobile-first)
- ✅ Filtros interactivos: Todos, Adopción, Venta, Marrón, Apricot, Rojo, Enano, Miniatura
- ✅ Algoritmo QPV visible con barra de progreso
- ✅ Botones WhatsApp con mensaje prellenado específico
- ✅ Badges de color diferenciados
- ✅ Consejos anti-estafas al final
- ✅ Botón de compartir nativo (WhatsApp, AirDrop, etc.)

### Datos incluidos (13 poodles):
- **5 adopciones GRATIS** (QPV 90-100)
- **8 en venta** desde S/ 2,500 hasta S/ 4,000 (QPV 70-86)
- Todos con enlaces WhatsApp funcionales
- Todos en Lima (ubicación verificada)
- Solo colores: Marrón, Apricot, Rojo
- Solo tamaños: Enano (28-35cm), Miniatura (35-45cm)

---

## 🔄 Cómo Actualizar el Dashboard

### Método 1: Edición manual (recomendado)
1. Abrir `poodles.html` en editor de texto
2. Buscar el array `const poodles = [...]` en JavaScript
3. Agregar/editar objetos con esta estructura:
   ```javascript
   {
     rank: 1,
     qpv: 100,
     title: "Poodle Mini Apricot - Criador X",
     price: 0, // 0 para adopción, número para venta
     type: "Adopción", // o "Venta"
     color: "Apricot", // Marrón, Apricot, Rojo
     size: "Miniatura", // Enano o Miniatura
     location: "Surco, Lima",
     contact: "WA: 999888777",
     waLink: "https://wa.me/51999888777?text=Hola,%20vi%20su%20Poodle%20Mini%20Apricot",
     notes: "Vacunado, pedigree, garantía",
     verified: true
   }
   ```
4. Guardar y abrir en navegador

### Método 2: Pedir al copiloto
Simplemente decir:
> "Busca poodles mini en Lima con estos criterios: [especificar] y actualiza el dashboard"

El copiloto debe:
1. Buscar en fuentes verificadas (ver sección anterior)
2. Validar ubicación (solo Lima)
3. Calcular QPV según algoritmo
4. Actualizar el array en `poodles.html`
5. Mantener diseño minimalista blanco

---

## ⚠️ Problemas Conocidos y Soluciones

### Problema: "El archivo no se puede abrir"
**Causa:** macOS Gatekeeper bloquea archivos descargados de internet.  
**Solución:** 
```bash
xattr -d com.apple.quarantine poodles.html
```

### Problema: "Los enlaces de WhatsApp no abren"
**Causa:** Número incorrecto o formato mal.  
**Solución:** Verificar que el enlace siga este formato exacto:
```
https://wa.me/51XXXXXXXXX?text=Mensaje%20codificado
```
- Código de país: 51 (Perú)
- Sin espacios ni guiones
- Mensaje URL-encoded

### Problema: "Los filtros no funcionan"
**Causa:** JavaScript deshabilitado en navegador.  
**Solución:** Habilitar JavaScript en Safari/Chrome.

---

## 🎯 Próximos Pasos Sugeridos

1. **Verificar disponibilidad real** de los 5 poodles en adopción gratuita (contactar por WhatsApp)
2. **Agregar más fuentes** de criadores verificados en Lima
3. **Implementar alertas automáticas** cuando aparezcan nuevos poodles (requiere servidor)
4. **Crear sistema de favoritos** para marcar poodles interesantes
5. **Agregar mapa** con ubicaciones de criadores en Lima

---

## 📞 Contacto de Fuentes Verificadas

| Criador | WhatsApp | Ubicación | Especialidad |
|---------|----------|-----------|--------------|
| Puppy Toy Perú | +51 920 688 338 | Los Olivos | Toy/Enano, todos los colores |
| Premium Kennel | +51 934 737 929 | Miraflores | Apricot/Rojo, pedigree |
| Lima Onepets | +51 989 886 841 | San Martín de Porres | Apricot, videollamada |
| WUF Perú | Web: wuf.pe | Lima metropolitana | Adopciones gratuitas |
| Adopta Lima | Web: adoptalima.org | Lima | Eventos mensuales |

---

## 📝 Notas Finales

- **El usuario NO quiere terminal/bash:** Prefiere doble clic en archivos HTML
- **El usuario NO quiere fotos:** Prefiere tabla de datos limpios
- **El usuario VALORA la verificación:** Mejor pocos datos reales que muchos inventados
- **El usuario BUSCA simplicidad:** Un archivo HTML > múltiples scripts Python
- **El usuario TIENE presupuesto limitado:** S/ 4,000 máximo, prefiere adopción gratuita

---

**Última actualización:** Junio 2026  
**Versión del dashboard:** v7 (criterios actualizados: mini 25-40cm, colores marrón/apricot/rojo)  
**Estado:** ✅ Funcional y verificado
