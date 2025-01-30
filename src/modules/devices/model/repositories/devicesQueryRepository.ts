import { AuthSessionsMongooseModel } from '../../../../app/config/db'
import { devicesMappers } from '../mappers/devicesMappers'

export const devicesQueryRepository = {
  async getDevices(userId: string) {
    const authSessions = await AuthSessionsMongooseModel.find({ userId })
    const devices = authSessions.map(devicesMappers.mapSessionsToDevicesView)

    return devices
  },
  async getAuthSessionByDeviceId(deviceId: string) {
    const authSession = await AuthSessionsMongooseModel.findOne({ deviceId })

    return authSession
  },
  async isAuthSessionExist(userId: string, deviceId: string, iat?: number) {
    const authSession = await AuthSessionsMongooseModel.findOne({
      userId,
      deviceId,
      iat,
    })

    return authSession
  },
}
