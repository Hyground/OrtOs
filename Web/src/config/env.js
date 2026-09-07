const rawApiUrl = import.meta.env.VITE_API_URL ?? ''

export const env = {
  apiUrl: rawApiUrl.replace(/\/$/, ''),
  appName: import.meta.env.VITE_APP_NAME ?? 'OrtOs',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
