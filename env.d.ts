declare global {
  interface ImportMeta {
    env: {
      __I18N_PLUGIN_MSG: string
      NODE_ENV: 'production' | 'development'
      PROD: boolean
      DEV: boolean
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      __I18N_PLUGIN_MSG: string
      NODE_ENV: 'production' | 'development'
      PROD: boolean
      DEV: boolean
    }
  }
}

export {}
