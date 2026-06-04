import type { SchoolRecord } from "../types/school";

/** Internal key when registry row has no country (legacy data). */
export const UNSPECIFIED_COUNTRY_KEY = "__unspecified_country__";

/** Internal key when registry row has no city. */
export const UNSPECIFIED_CITY_KEY = "__unspecified_city__";

export function normalizeCountryKey(country: string | null | undefined): string {
  const trimmed = country?.trim();
  return trimmed ? trimmed : UNSPECIFIED_COUNTRY_KEY;
}

export function normalizeCityKey(city: string | null | undefined): string {
  const trimmed = city?.trim();
  return trimmed ? trimmed : UNSPECIFIED_CITY_KEY;
}

export function countryLabel(
  countryKey: string,
  unspecifiedLabel: string,
): string {
  return countryKey === UNSPECIFIED_COUNTRY_KEY ? unspecifiedLabel : countryKey;
}

export function cityLabel(cityKey: string, unspecifiedLabel: string): string {
  return cityKey === UNSPECIFIED_CITY_KEY ? unspecifiedLabel : cityKey;
}

export function getCountryOptions(
  schools: SchoolRecord[],
  unspecifiedCountryLabel: string,
): { value: string; label: string }[] {
  const byKey = new Map<string, number>();

  for (const school of schools) {
    const key = normalizeCountryKey(school.country);
    byKey.set(key, (byKey.get(key) ?? 0) + 1);
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => {
      if (a === UNSPECIFIED_COUNTRY_KEY) return 1;
      if (b === UNSPECIFIED_COUNTRY_KEY) return -1;
      return countryLabel(a, unspecifiedCountryLabel).localeCompare(
        countryLabel(b, unspecifiedCountryLabel),
      );
    })
    .map(([value, count]) => ({
      value,
      label: `${countryLabel(value, unspecifiedCountryLabel)} (${count})`,
    }));
}

export function getCityOptions(
  schools: SchoolRecord[],
  countryKey: string,
  unspecifiedCityLabel: string,
): { value: string; label: string }[] {
  const byKey = new Map<string, number>();

  for (const school of schools) {
    if (normalizeCountryKey(school.country) !== countryKey) continue;
    const key = normalizeCityKey(school.city);
    byKey.set(key, (byKey.get(key) ?? 0) + 1);
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => {
      if (a === UNSPECIFIED_CITY_KEY) return 1;
      if (b === UNSPECIFIED_CITY_KEY) return -1;
      return cityLabel(a, unspecifiedCityLabel).localeCompare(
        cityLabel(b, unspecifiedCityLabel),
      );
    })
    .map(([value, count]) => ({
      value,
      label: `${cityLabel(value, unspecifiedCityLabel)} (${count})`,
    }));
}

export function getSchoolsInLocation(
  schools: SchoolRecord[],
  countryKey: string,
  cityKey: string,
): SchoolRecord[] {
  return schools
    .filter(
      (school) =>
        normalizeCountryKey(school.country) === countryKey &&
        normalizeCityKey(school.city) === cityKey,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}
