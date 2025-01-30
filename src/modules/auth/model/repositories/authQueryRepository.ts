import { AuthSessionsMongooseModel, UsersMongooseModel } from '../../../../app/config/db'
import { authMappers } from '../mappers/authMappers'

export const authQueryRepository = {
  async getUserMeModelById(userId: string) {
    const foundUser = await UsersMongooseModel.findOne({ _id: userId })

    return foundUser && authMappers.mapDbUserToMeModel(foundUser)
  },
  async getUserByLoginOrEmail(loginOrEmail: string) {
    const users = await UsersMongooseModel.find({
      $or: [
        { 'userData.login': loginOrEmail },
        { 'userData.email': loginOrEmail },
      ]
    })

    if (users.length !== 1) {
      return false
    }

    return users[0]
  },
  async getUserByConfirmationCode(confirmationCode: string) {
    return UsersMongooseModel.findOne({ 'confirmationData.confirmationCode': confirmationCode })
  },
  async getUserByPasswordRecoveryConfirmationCode(recoveryCode: string) {
    return UsersMongooseModel.findOne({ 'confirmationData.passwordRecoveryCode': recoveryCode })
  },
  async isAuthSessionExist(userId: string, deviceId: string, iat: number) {
    const authSession = await AuthSessionsMongooseModel.findOne({
      userId,
      deviceId,
      iat,
    })

    return Boolean(authSession)
  },
}
