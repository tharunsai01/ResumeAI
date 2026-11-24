/// <reference types="vite/client" />

declare const __MOCK__: boolean;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_GITHUB_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
