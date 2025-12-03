export type Municipio = {
  id: string;
  nm: string; // nombre
  province?: string;
};

// Lista de ciudades IMPORTANTES que deben aparecer SIEMPRE primero
const CIUDADES_IMPORTANTES = new Set([
  'madrid', 'barcelona', 'valencia', 'sevilla', 'zaragoza', 'malaga', 'murcia',
  'palma', 'bilbao', 'alicante', 'cordoba', 'valladolid', 'vigo', 'gijon',
  'hospitalet', 'vitoria', 'coruña', 'granada', 'oviedo', 'badalona', 'cartagena',
  'terrassa', 'jerez', 'sabadell', 'mostoles', 'santander', 'almeria', 'pamplona',
  'caceres', 'logroño', 'badajoz', 'salamanca', 'huelva', 'leon', 'tarragona',
  'cadiz', 'marbella', 'burgos', 'albacete', 'santander', 'castellon', 'alcorcon'
]);

// TRIPLE CACHÉ: completo + índice 2 letras + búsquedas recientes
let cachedMunicipios: Municipio[] | null = null;
let indexedBy2Letters: Map<string, Municipio[]> | null = null;
let searchCache = new Map<string, Municipio[]>();

// Lazy loading: solo cargar cuando se necesite
export const getMunicipios = (): Municipio[] => {
  if (!cachedMunicipios) {
    cachedMunicipios = require('./municipios.json') as Municipio[];
  }
  return cachedMunicipios as Municipio[];
};

// Normalizar texto quitando tildes - OPTIMIZADO
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Score de importancia: ciudades principales + bonus por longitud
const getImportanceScore = (name: string): number => {
  const normalized = normalize(name);
  
  // Ciudades importantes: BOOST BRUTAL
  if (CIUDADES_IMPORTANTES.has(normalized)) {
    return 5000;
  }
  
  // Bonus por longitud (nombres cortos suelen ser ciudades grandes)
  const len = name.length;
  if (len <= 6) return 1000;   // Madrid, Málaga
  if (len <= 9) return 500;    // Barcelona, Zaragoza
  if (len <= 12) return 200;
  return 0;
};

// Índice por PRIMERAS 2 LETRAS (reduce búsqueda de 8,131 a ~50-150 pueblos)
const getIndexedMunicipios = (): Map<string, Municipio[]> => {
  if (!indexedBy2Letters) {
    const municipios = getMunicipios();
    indexedBy2Letters = new Map();
    
    municipios.forEach(m => {
      const normalized = normalize(m.nm);
      // Índice por 2 primeras letras (ma, ba, ca, etc)
      const key = normalized.substring(0, 2);
      if (!indexedBy2Letters!.has(key)) {
        indexedBy2Letters!.set(key, []);
      }
      indexedBy2Letters!.get(key)!.push(m);
    });
  }
  return indexedBy2Letters;
};

// BÚSQUEDA BRUTAL OPTIMIZADA
export const searchMunicipios = (query: string, limit = 5): Municipio[] => {
  if (!query || query.length < 2) {
    searchCache.clear();
    return [];
  }
  
  const q = normalize(query.trim());
  
  // CACHÉ: si ya buscamos esto, respuesta INSTANTÁNEA
  if (searchCache.has(q)) {
    return searchCache.get(q)!;
  }
  
  // Usar índice por 2 primeras letras para filtrar rápido
  const twoLetters = q.substring(0, 2);
  const index = getIndexedMunicipios();
  const candidates = index.get(twoLetters) || [];
  
  const results: Array<{ municipio: Municipio; score: number }> = [];
  
  // Buscar en los candidatos filtrados
  for (const municipio of candidates) {
    const name = normalize(municipio.nm);
    let score = 0;
    
    // Scoring: match + importancia (ciudades grandes primero)
    const importanceBonus = getImportanceScore(municipio.nm);
    
    if (name === q) {
      score = 10000 + importanceBonus;
    } else if (name.startsWith(q)) {
      score = 5000 + importanceBonus;
    } else if (name.includes(q)) {
      score = 1000 + importanceBonus;
    }
    
    if (score > 0) {
      results.push({ municipio, score });
    }
  }
  
  // Ordenar por score (match + importancia) - los más importantes primero
  const finalResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.municipio);
  
  // Guardar en caché (limitar a 50 búsquedas)
  if (searchCache.size > 50) {
    searchCache.clear();
  }
  searchCache.set(q, finalResults);
  
  return finalResults;
};
