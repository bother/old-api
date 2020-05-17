declare namespace NodeJS {
  export interface ProcessEnv {
    MONGO_URI: string
    PORT: string
    TOKEN_SECRET: string
  }
}
