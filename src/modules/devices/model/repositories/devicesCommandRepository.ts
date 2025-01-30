import { AuthSessionsMongooseModel } from '../../../../app/config/db'

export const devicesCommandRepository = {
  async deleteAllOtherSessions(userDevicesIdsWithoutCurrent: string[]) {
    const result = await AuthSessionsMongooseModel.deleteMany({
      deviceId: { $in: userDevicesIdsWithoutCurrent },
    })

    return result.deletedCount
  },

  async deleteSessionByDeviceId(deviceId: string) {
    const result = await AuthSessionsMongooseModel.deleteOne({ deviceId })

    return Boolean(result.deletedCount)
  },
}
