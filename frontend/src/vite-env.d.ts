/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Microsoft Clarity project ID. Leave empty to disable telemetry. */
  readonly VITE_CLARITY_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
