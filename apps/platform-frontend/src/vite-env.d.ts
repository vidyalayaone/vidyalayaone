/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  readonly VITE_DEMO_URL: string
  readonly VITE_PAYMENT_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
