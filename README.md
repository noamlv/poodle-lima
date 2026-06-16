# Poodle Lima - Dashboard de Poodles en Lima

Dashboard web de poodles enanos (28-35cm) y miniatura (35-45cm) en Lima, Peru. Colores marron, apricot y rojo. Adopciones gratis y venta hasta S/ 4,000.

**Dashboard online:** https://noamlv.github.io/poodle-lima/poodles.html

## Contenido

- 1 archivo HTML (`poodles.html`) con todo incluido (CSS + JS + datos)
- README.md con documentacion

## Mejoras del Dashboard (v8)

- **QPV con desglose interactivo** - Haz clic en el puntaje para ver base, bonificaciones y penalizaciones
- **14 poodles reales** verificados con enlaces WhatsApp directos
- **Filtros**: por tipo (adopcion/venta), color (marron/apricot/rojo), tamano (enano/miniatura)
- **Ordenamiento**: por QPV, precio ascendente, precio descendente
- **Busqueda textual** por nombre, criador o ubicacion
- **Criadores verificados**: Puppy Toy Peru, Premium Kennel, Lima Onepets con enlaces directos
- **Estadisticas**: total, adopciones, ventas, rango de precios, QPV promedio
- **100% responsive** - funciona en mobil y desktop
- **Compartir nativo** - via WhatsApp, AirDrop, etc.

## Algoritmo QPV

| Tipo | Puntuacion Base |
|------|----------------|
| Adopcion gratuita | 100 |
| Venta S/ 1,800-2,500 | 90 |
| Venta S/ 2,500-2,800 | 85 |
| Venta S/ 3,000-3,500 | 75 |
| Venta S/ 3,800-4,000 | 70 |

Bonificaciones: +5 color prioritario, +5 tamano ideal, +10 criador verificado, +5 vacunas, +5 pedigree, +5 garantia salud

Penalizaciones: -10 sin datos salud, -20 ubicacion no verificada, -15 precio >S/3500 sin pedigree, -10 enlace generico

## Como actualizar los datos

1. Editar `poodles.html`
2. Buscar `const poodles = [` en JavaScript
3. Agregar o modificar objetos con la estructura existente
4. Commit y push a GitHub

Estructura de cada poodle:

```javascript
{
  id: 15,
  titulo: "Poodle Mini Marron - Criador X",
  subtitulo: "Ubicacion y contacto",
  tipo: "adopcion", // o "venta"
  precio: 0, // 0 para adopcion
  color: "marron", // marron, apricot, rojo
  tamano: "enano", // enano o miniatura
  ubicacion: "Distrito, Lima",
  contacto: "Nombre",
  wa: "51999988877", // o "" si no hay WhatsApp
  link: "https://...",
  notas: "Informacion adicional",
  badges: ["lima_verificado"], // etiquetas de verificacion
  estado: "disponible", // o "consultar"
  qpvBase: 100, // segun tabla
  bonuses: ["color_prioritario", "tamano_ideal"],
  penalties: []
}
```

## GitHub Actions

- **Deploy a Pages**: Se activa automaticamente al hacer push a `main`
- **Verificar enlaces**: Corre cada lunes a las 10am, crea un Issue si encuentra enlaces rotos
- **Actualizar datos**: Workflow manual para validar cambios

## Fuentes verificadas

| Criador | WhatsApp | Ubicacion |
|---------|----------|-----------|
| Puppy Toy Peru | +51 920 688 338 | Los Olivos |
| Premium Kennel | +51 934 737 929 | Miraflores |
| Lima Onepets | +51 989 886 841 | San Martin de Porres |

## Contacto

Proyecto personal de Noam Lopez.
