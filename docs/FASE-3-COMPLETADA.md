# FASE 3 COMPLETADA - CATEGORÍAS Y SUBCATEGORÍAS

**Fecha**: 2 de diciembre de 2025  
**Estado**: ✅ COMPLETADO

---

## RESUMEN

Se ha reorganizado completamente el sistema de categorías de Motans según la visión del producto, con:

1. ✅ 5 categorías principales rediseñadas según funcionalidad real
2. ✅ Colores únicos por categoría aplicados en toda la UI
3. ✅ Subcategorías con el mismo color que su categoría padre
4. ✅ Iconos actualizados para reflejar mejor cada categoría
5. ✅ Funciones helper mejoradas
6. ✅ 0 errores de TypeScript

---

## CATEGORÍAS REDISEÑADAS

### Sistema anterior vs Sistema nuevo

| Antes | Después | Cambio principal |
|-------|---------|-----------------|
| Comunidad | **Social** | Más claro - "muro del pueblo" |
| Gastronomía | **Servicios** | Profesionales y oficios |
| Marketplace | **Marketplace** | Se mantiene |
| Ocio | **Gastro & Salva comida** | Enfoque en comida y rescate |
| Info Útil | **Canales de chat** | Comunicación directa |

---

## CATEGORÍAS FINALES

### 1. 🔵 SOCIAL (Cyan #06B6D4)
**Icon**: `people`  
**Concepto**: Periódico del pueblo y vida comunitaria

**Subcategorías** (6):
- Muro del pueblo
- Avisos importantes
- Perdido/Encontrado
- Ayuda entre vecinos
- Planes de hoy
- Recuerdos del pueblo

**Uso típico**:
- Noticias del pueblo
- Eventos y actividades
- Avisos importantes (cortes de agua, obras, etc.)
- Objetos perdidos o encontrados
- Pedir ayuda a vecinos
- Organizar planes para hoy
- Compartir fotos antiguas del pueblo

---

### 2. 🟠 SERVICIOS (Orange #F59E0B)
**Icon**: `construct`  
**Concepto**: Profesionales, oficios y ayuda especializada

**Subcategorías** (7):
- Manitas y reformas
- Casa y limpieza
- Cuidado personal
- Niños y mayores
- Mascotas
- Clases y formación
- Servicios digitales

**Uso típico**:
- Fontaneros, electricistas, albañiles
- Limpiadoras, jardineros
- Peluquería, estética, barbería
- Canguros, cuidado de mayores
- Veterinarios, adiestradores, paseo de perros
- Clases particulares, idiomas, música
- Diseño web, community manager, programación

**Importante**: 
- Aquí se publican **ofertas de servicio** (profesionales)
- También se crean **solicitudes de servicio** (clientes que buscan profesionales)

---

### 3. 🟢 MARKETPLACE (Green #10B981)
**Icon**: `storefront`  
**Concepto**: Compraventa, trueque y economía circular

**Subcategorías** (5):
- Segunda mano
- Trueque
- Te lo regalo
- Km 0 / Productos locales
- Lotes sorpresa

**Uso típico**:
- Vender muebles, ropa, electrodomésticos usados
- Intercambiar cosas (libro por libro, juguetes, etc.)
- Regalar cosas que ya no necesitas
- Vender productos locales (huevos, miel, verduras del huerto)
- Lotes sorpresa (bolsas de ropa, libros, etc. a precio fijo)

**Importante**:
- Esta es la categoría de **economía circular**
- Fomenta el consumo responsable y local
- No es solo venta, también trueque y regalos

---

### 4. 🟣 GASTRO & SALVA COMIDA (Purple #8B5CF6)
**Icon**: `restaurant`  
**Concepto**: Gastronomía y rescate de comida

**Subcategorías** (6):
- Comer hoy
- Desayunos y meriendas
- Copas y tapeo
- Casero del pueblo
- Rescata comida hoy
- Héroes de la comida

**Uso típico**:
- Menús del día, ofertas de restaurantes
- Desayunos especiales, meriendas
- Planes de tapas, copas, cenas
- Comida casera (tortillas, empanadas, tartas hechas en casa)
- **Packs de salva comida** con descuento (Too Good To Go style)
- Reconocimiento a quienes rescatan comida

**Importante**:
- **Salva comida** es una feature clave de Motans
- Los restaurantes publican packs con descuento antes del cierre
- Evita desperdiciar comida, beneficia al negocio y al cliente
- "Héroes de la comida" = badge/gamificación para usuarios que rescatan

---

### 5. 🔴 CANALES DE CHAT (Red #EF4444)
**Icon**: `chatbubbles`  
**Concepto**: Comunicación directa y canales temáticos

**Subcategorías** (9):
- Canal principal
- Fútbol y deportes
- Padres del cole
- Mascotas
- Fiestas y peñas
- Gamers
- Arte y cultura
- Trabajo y chapuzas
- + Crear tu canal

**Uso típico**:
- Chat general del pueblo
- Hablar de fútbol, quedadas deportivas
- Padres organizándose para coles, cumples
- Dueños de mascotas: consejos, quedadas
- Organizar fiestas, peñas, eventos
- Gamers del pueblo conectando
- Artistas locales, eventos culturales
- Buscar/ofrecer trabajo rápido, chapuzas
- **Los usuarios pueden crear sus propios canales** (públicos o privados)

**Importante**:
- Cualquier usuario puede crear un canal
- El creador es el admin del canal
- Pueden ser públicos (todos entran) o privados (solo invitados)
- Los canales pertenecen a un pueblo
- Límites de canales según plan de suscripción

---

## COLORES Y DISEÑO

### Paleta de colores

```typescript
const CATEGORY_COLORS = {
  social: "#06B6D4",        // Cyan - Comunicación
  servicios: "#F59E0B",     // Orange - Profesionalidad
  marketplace: "#10B981",   // Green - Sostenibilidad
  gastro: "#8B5CF6",        // Purple - Experiencia
  chat: "#EF4444",          // Red - Energía
};
```

### Aplicación de colores

**CategoryCarousel** (tabs principales):
- Background activo: color de la categoría
- Borde activo: color de la categoría
- Icono activo: blanco
- Texto activo: blanco
- Icono inactivo: color de la categoría
- Texto inactivo: color de la categoría

**SubcategoryTabs** (tabs secundarios):
- Background activo: color de la categoría padre
- Borde activo: color de la categoría padre
- Texto activo: blanco
- Background inactivo: blanco
- Borde inactivo: color de la categoría padre
- Texto inactivo: color de la categoría padre

**Flechas de scroll**:
- Color del icono: color de la categoría activa
- Background: rgba(255, 255, 255, 0.7)

---

## CAMBIOS TÉCNICOS

### 1. `src/data/categories.ts`

**Cambios principales**:
```typescript
// Antes
{
  key: "community",
  label: "Comunidad",
  icon: "people",
  color: "#06B6D4",
  subcategories: [
    { key: "news", label: "Noticias" },
    { key: "events", label: "Eventos" },
    { key: "alerts", label: "Avisos" },
    { key: "groups", label: "Grupos" },
  ],
}

// Después
{
  key: "community",
  label: "Social",  // ← Nombre más claro
  icon: "people",
  color: "#06B6D4",
  subcategories: [
    { key: "wall", label: "Muro del pueblo" },
    { key: "alerts", label: "Avisos importantes" },
    { key: "lost_found", label: "Perdido/Encontrado" },
    { key: "help", label: "Ayuda entre vecinos" },
    { key: "plans", label: "Planes de hoy" },
    { key: "memories", label: "Recuerdos del pueblo" },  // ← 6 subcategorías
  ],
}
```

**Nuevas funciones exportadas**:
```typescript
// Obtener color de una categoría
export function getCategoryColor(key: CategoryKey): string;

// Obtener todas las subcategorías
export function getSubcategories(categoryKey: CategoryKey): SubcategoryConfig[];
```

**Categoría por defecto**:
```typescript
// Antes
export const DEFAULT_CATEGORY_KEY: CategoryKey = "food";

// Después
export const DEFAULT_CATEGORY_KEY: CategoryKey = "community";
// Ahora al abrir la app, se muestra "Social" por defecto
```

---

### 2. `src/components/SubcategoryTabs.tsx`

**Cambio clave**: Las subcategorías heredan el color de su categoría padre

```typescript
// Obtener color de la categoría padre
const categoryColor = category?.color ?? "#06B6D4";

// Aplicar a chips
<Pressable
  style={[
    styles.chip,
    { borderColor: categoryColor },  // ← Borde del color de la categoría
    isActive && { backgroundColor: categoryColor, borderColor: categoryColor }
  ]}
>
  <Text style={[
    styles.chipLabel,
    { color: categoryColor },  // ← Texto del color de la categoría
    isActive && styles.chipLabelActive
  ]}>
    {sub.label}
  </Text>
</Pressable>

// Aplicar a flechas
<Ionicons name="chevron-back" size={20} color={categoryColor} />
```

**Resultado visual**:
- Cuando seleccionas "Social" (cyan): todas las subcategorías son cyan
- Cuando seleccionas "Servicios" (orange): todas las subcategorías son orange
- Cuando seleccionas "Marketplace" (green): todas las subcategorías son green
- Cuando seleccionas "Gastro" (purple): todas las subcategorías son purple
- Cuando seleccionas "Chat" (red): todas las subcategorías son red

---

## REGLAS DE NEGOCIO POR CATEGORÍA

### SOCIAL
- **Quién puede publicar**: Todos (usuarios, negocios, profesionales)
- **Límites**: Según plan de suscripción
- **Visibilidad**: Solo en el pueblo (townId)
- **Destacados**: Negocios pueden pagar por destacar eventos

### SERVICIOS
- **Quién puede publicar**: 
  - Profesionales publican **ofertas de servicio**
  - Usuarios publican **solicitudes de servicio**
- **Límites**: 
  - Profesionales: según plan
  - Usuarios: 5 solicitudes activas máximo
- **Radio de búsqueda**: 5, 10, 25, 50 km
- **Sistema de presupuestos**: Los profesionales envían presupuestos a las solicitudes

### MARKETPLACE
- **Quién puede publicar**: Todos
- **Tipos de transacción**: Venta, Trueque, Regalo, Km 0, Alquiler
- **Precio**: Opcional (en "Te lo regalo" siempre es 0)
- **Estado del producto**: Nuevo, Como nuevo, Bueno, Aceptable, Malo
- **Gestión de vendido**: Marcar como vendido cuando se cierra la transacción

### GASTRO & SALVA COMIDA
- **Quién puede publicar**: 
  - Negocios (restaurantes, bares, cafeterías)
  - Usuarios normales (comida casera)
- **Packs de salva comida**:
  - Deben tener ventana de recogida (hora inicio y fin)
  - Stock limitado
  - Descuento sobre precio original
  - Pueden tener etiquetas (vegano, sin gluten, etc.)
- **Gamificación**: Badge de "Héroe de la comida" para usuarios que rescatan

### CANALES DE CHAT
- **Quién puede crear**: Según plan de suscripción
  - Free: 1 canal propio
  - Basic: 3 canales
  - Plus: 10 canales
  - Pro: 999 canales
- **Tipos**: Públicos (todos pueden entrar) o Privados (solo invitados)
- **Moderación**: El creador es admin, puede añadir moderadores
- **Límites de mensajes**: 10 mensajes/minuto, 100 mensajes/hora

---

## PRÓXIMOS PASOS (FASE 4)

La FASE 4 se centrará en:

1. **Flujos de publicación por categoría**:
   - Formulario específico para Social (título, descripción, imágenes, tags)
   - Formulario para Servicios (oferta vs solicitud)
   - Formulario para Marketplace (precio, estado, tipo de transacción)
   - Formulario para Gastro (con campos específicos para salva comida)
   - Formulario para crear canales de chat

2. **Filtrado real de publicaciones**:
   - TownFeed debe filtrar posts por categoryId y subCategoryId seleccionados
   - Mostrar mensaje cuando no hay posts: "Aún no hay publicaciones en esta categoría"

3. **Reglas de pueblo**:
   - Asegurar que al publicar se usa currentTownId
   - Preparar lógica para cambiar de pueblo
   - Decidir qué hacer con posts antiguos al cambiar de pueblo

4. **Sistema de solicitudes de servicio**:
   - Crear ServiceRequestScreen
   - Crear ServiceQuotesScreen
   - Flujo completo: solicitar → recibir presupuestos → aceptar → completar

---

## VALIDACIÓN

### TypeScript
```bash
npx tsc --noEmit
# ✅ 0 errores
```

### Pruebas visuales
- ✅ CategoryCarousel muestra 5 categorías con colores únicos
- ✅ Al cambiar de categoría, SubcategoryTabs cambia de color
- ✅ Flechas de scroll usan el color de la categoría activa
- ✅ Categoría por defecto es "Social" (cyan)

---

## ESTRUCTURA FINAL

```
apps/mobile/src/
├── data/
│   └── categories.ts              ✅ REDISEÑADO
│       - 5 categorías nuevas con nombres claros
│       - Subcategorías reorganizadas (4-9 por categoría)
│       - Nuevas funciones: getCategoryColor, getSubcategories
│       - DEFAULT_CATEGORY_KEY = "community"
│
└── components/
    ├── CategoryCarousel.tsx       ✅ FUNCIONANDO
    │   - Aplica color dinámico por categoría
    │
    └── SubcategoryTabs.tsx        ✅ MODIFICADO
        - Hereda color de categoría padre
        - Flechas usan color de categoría
```

---

## RESUMEN DE CAMBIOS

| Archivo | Líneas modificadas | Cambios principales |
|---------|-------------------|-------------------|
| `categories.ts` | ~150 | Rediseño completo de categorías y subcategorías |
| `SubcategoryTabs.tsx` | ~30 | Aplicación dinámica de colores |

**Total**: ~180 líneas modificadas, 0 errores, 100% funcional.

---

**FIN DE FASE 3**

**Próxima fase**: FASE 4 - Flujos de publicación y lógica por pueblo
