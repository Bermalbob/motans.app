const { getDefaultConfig } = require("expo/metro-config");

/**
 * Metro configuration para la app móvil Motans.
 * De momento usamos la config por defecto de Expo,
 * sin cosas raras de monorepo ni overrides.
 */
const config = getDefaultConfig(__dirname);

module.exports = config;
