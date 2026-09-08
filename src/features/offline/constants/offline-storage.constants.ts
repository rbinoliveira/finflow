export const OFFLINE_DATABASE_NAME = 'finflow-offline'
export const OFFLINE_DATABASE_VERSION = 2

export const OFFLINE_STORE = {
  records: 'registros',
  outbox: 'outbox',
} as const

export const OFFLINE_INDEX = {
  byCollection: 'porColecao',
  byCreatedAt: 'porCriadoEm',
} as const

export const SERVICE_WORKER_PATH = '/sw.js'
export const SERVICE_WORKER_SCOPE = '/'
export const WEB_MANIFEST_PATH = '/manifest.webmanifest'

export const SYNC_RETRY_LIMIT = 8
