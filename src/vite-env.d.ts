/// <reference types="vite/client" />

declare module 'virtual:conteudo' {
  import type { Conteudo } from './content/schema';
  const conteudo: Conteudo;
  export default conteudo;
}

interface ImportMetaEnv {
  /** URL do Worker OAuth do CMS (variável de repositório CMS_AUTH_URL). */
  readonly VITE_CMS_AUTH_URL?: string;
}

declare module 'decap-cms-locales' {
  export const pt: Record<string, unknown>;
}
