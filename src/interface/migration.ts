export interface IMigration {
  migrate: () => Promise<void>
  serviceName: string
}

export interface AuthorizeData {
  TOKEN: string
  API_SERVER: string | undefined
  TEAM_NAME?: string | undefined
}
