import { apiRequest } from './client';

// Los catálogos casi no cambian: se piden una vez y se reutilizan.
let cache = null;

export function consultarCatalogos() {
  if (!cache) {
    cache = apiRequest('catalogos/').catch((error) => {
      cache = null;
      throw error;
    });
  }
  return cache;
}
