export type AuthSessionsDbModel = {
  userId: string
  deviceId: string
  deviceName: string
  ip: string
  iat: number
  exp: number
}
