/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_PROTECTION_KEY?: string;
  readonly VITE_ADMIN_LOGIN_PATH?: string;
  readonly VITE_AI_CLEANER?: string;
  readonly VITE_AI_SUMMARY?: string;
  readonly VITE_AI_PROMPT?: string;
  readonly VITE_AI_RAG?: string;
  readonly VITE_AI_ASSISTANT?: string;
  readonly VITE_AI_ANALYTICS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "turndown-plugin-gfm" {
  export const gfm: any;
  export const tables: any;
  export const strikethrough: any;
  export const taskListItems: any;
  export const highlightedCodeBlock: any;
}

declare module "prerender-node" {
  const prerender: any;
  export default prerender;
}


