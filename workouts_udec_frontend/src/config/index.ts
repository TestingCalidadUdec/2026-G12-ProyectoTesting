interface AppConfig {
  apiBaseUrl: string;
  appTitle: string;
  appVersion: string;
  debugMode: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value;
};

const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
};

export const config: AppConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api'),
  appTitle: getEnvVar('VITE_APP_TITLE', 'Workout Tracker'),
  appVersion: getEnvVar('VITE_APP_VERSION', '0.1.0'),
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', false),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Log configuration in development mode
if (config.isDevelopment && config.debugMode) {
  console.log('App Configuration:', config);
}

export default config;