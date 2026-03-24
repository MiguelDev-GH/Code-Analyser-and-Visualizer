/**
 * useSettings – persists all user preferences in cookies.
 *
 * Cookie format: "key=value; max-age=31536000; path=/"
 * (1 year expiry, available on every path)
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

// ---------- helpers ----------

function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/`;
}

// ---------- defaults ----------

const DEFAULTS = {
  theme: 'light',
  language: 'english',
  showNodeDescriptions: false,
  edgeType: 'default',
  edgeWidth: 2,
  layoutDirection: 'LR',
  isExceptionFilterActive: false,
};

// ---------- read all cookies once at module load ----------

function readAll() {
  return {
    theme: getCookie('setting_theme') ?? DEFAULTS.theme,
    language: getCookie('setting_language') ?? DEFAULTS.language,
    showNodeDescriptions:
      getCookie('setting_showNodeDescriptions') === null
        ? DEFAULTS.showNodeDescriptions
        : getCookie('setting_showNodeDescriptions') === 'true',
    edgeType: getCookie('setting_edgeType') ?? DEFAULTS.edgeType,
    edgeWidth: getCookie('setting_edgeWidth')
      ? Number(getCookie('setting_edgeWidth'))
      : DEFAULTS.edgeWidth,
    layoutDirection:
      getCookie('setting_layoutDirection') ?? DEFAULTS.layoutDirection,
    isExceptionFilterActive:
      getCookie('setting_isExceptionFilterActive') === null
        ? DEFAULTS.isExceptionFilterActive
        : getCookie('setting_isExceptionFilterActive') === 'true',
  };
}

// ---------- public API ----------

/**
 * Returns the initial values for all settings (read from cookies) plus
 * a `persist(key, value)` function to call whenever a setting changes.
 */
export function useSettings() {
  const initial = readAll();

  function persist(key, value) {
    setCookie(`setting_${key}`, value);
  }

  return { initial, persist };
}
