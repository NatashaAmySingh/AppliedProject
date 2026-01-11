import axios from 'axios';

let countriesCache = null;

export async function loadCountries() {
  if (countriesCache) return countriesCache;
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('/meta/countries', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    countriesCache = Array.isArray(res.data) ? res.data : [];
    return countriesCache;
  } catch (err) {
    console.error('Failed to load countries:', err);
    countriesCache = [];
    return countriesCache;
  }
}

export function getCountryName(id) {
  if (!countriesCache) return id || 'Unknown';
  const found = countriesCache.find((c) => String(c.id) === String(id));
  return found ? found.name : (id || 'Unknown');
}

export function clearCountriesCache() {
  countriesCache = null;
}
