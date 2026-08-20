// Re-export the native module. On web, it will be resolved to ExpoScreenTimeModule.web.ts
// and on native platforms to ExpoScreenTimeModule.ts
export { default } from './src/ExpoScreenTimeModule';
export * from './src/ExpoScreenTime.types';
