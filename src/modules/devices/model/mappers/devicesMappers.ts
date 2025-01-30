import { WithId } from 'mongodb'
import { AuthSessionsDbModel } from '../../../auth'
import { DeviceViewModel } from '../types/DeviceViewModel'

export const devicesMappers = {
  mapSessionsToDevicesView(authSessions: WithId<AuthSessionsDbModel>): DeviceViewModel {
    return {
      ip: authSessions.ip,
      title: authSessions.deviceName,
      lastActiveDate: new Date(authSessions.iat).toISOString(),
      deviceId: authSessions.deviceId,
    }
  },
}
