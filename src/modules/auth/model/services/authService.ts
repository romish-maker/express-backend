import { cryptService, jwtService, operationsResultService } from '../../../common/services'
import { ConfirmationInfoModel, UserDataModel, UserDbModel, UserInputModel } from '../../../users'
import { v4 as uuidv4 } from 'uuid'
import { add } from 'date-fns'
import { authQueryRepository } from '../repositories/authQueryRepository'
import { authCommandRepository } from '../repositories/authCommandRepository'
import { emailManager } from '../../../common/managers/emailManager'
import { ResultToRouterStatus } from '../../../common/enums/ResultToRouterStatus'
import {
  ErrorMessageHandleResult,
  errorMessagesHandleService
} from '../../../common/services/errorMessagesHandleService'
import { ResultToRouter } from '../../../common/types'
import { AuthSessionsDbModel } from '../types/AuthSessionsDbModel'

export const authService = {
  async createTokenPair(loginOrEmail: string, password: string, deviceName: string, ip: string) {
    const user = await authQueryRepository.getUserByLoginOrEmail(loginOrEmail)
    if (!user) {
      return false
    }

    const isPasswordValid = await cryptService.checkPassword(password, user.userData.passwordHash)

    if (!isPasswordValid) {
      return false
    }

    const deviceId = uuidv4()
    const { accessToken, refreshToken } = await jwtService.createTokenPair(user, deviceId)

    if (!accessToken || !refreshToken) {
      return false
    }

    await this.createAuthSession(refreshToken, user._id.toString(), deviceName, ip)

    return { accessToken, refreshToken }
  },
  async updateTokenPair(refreshToken: string) {
    const tokenData = await this.getTokenData(refreshToken)
    if (!tokenData) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    const userId = await jwtService.getUserIdByToken(refreshToken, 'refresh')
    const user = userId && await authQueryRepository.getUserMeModelById(userId)

    if (!userId || !user) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    const hasAuthSession = await authQueryRepository.isAuthSessionExist(userId, tokenData.deviceId, tokenData?.iat ?? 0)
    const userFromDb = await authQueryRepository.getUserByLoginOrEmail(user.email)
    if (!hasAuthSession || !userFromDb) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    const { accessToken, refreshToken: updatedRefreshToken } = await jwtService.createTokenPair(userFromDb, tokenData.deviceId)

    if (!accessToken || !updatedRefreshToken) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    await this.updateAuthSession(userId, updatedRefreshToken)

    return operationsResultService.generateResponse(
      ResultToRouterStatus.SUCCESS,
      { accessToken, refreshToken: updatedRefreshToken },
    )
  },
  async logoutUser(refreshToken: string) {
    const tokenData = await this.getTokenData(refreshToken)
    if (!tokenData) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    const userId = await jwtService.getUserIdByToken(refreshToken, 'refresh')
    const user = userId && await authQueryRepository.getUserMeModelById(userId)

    if (!userId || !user) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    const hasAuthSession = await authQueryRepository.isAuthSessionExist(userId, tokenData.deviceId, tokenData?.iat ?? 0)
    if (!hasAuthSession) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_AUTHORIZED)
    }

    await authCommandRepository.deleteAuthSession(userId, tokenData.deviceId, tokenData?.iat ?? 0)

    return operationsResultService.generateResponse(ResultToRouterStatus.SUCCESS)
  },
  async registerUser(payload: UserInputModel) {
    const { login, email, password } = payload
    const passwordHash = await cryptService.generateHash(password)

    const userData: UserDataModel = {
      login,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    const confirmationData: ConfirmationInfoModel = {
      confirmationCode: uuidv4(),
      confirmationCodeExpirationDate: add(new Date(), {
        hours: 1,
        minutes: 1,
      }),
      isConfirmed: false,
    }

    const newUserRegistration: UserDbModel = {
      userData,
      confirmationData,
    }

    await authCommandRepository.registerUser(newUserRegistration)

    try {
      const mailInfo = await emailManager.sendRegistrationEmail(email, confirmationData.confirmationCode)
      console.log('@> Information::mailInfo: ', mailInfo)
    } catch (err) {
      console.error('@> Error::emailManager: ', err)
    }

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: null,
    }
  },
  async sendPasswordRecoveryEmail(email: string) {
    const user = await authQueryRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    const plainUser = user.toObject()

    const updateUserData: UserDbModel = {
      userData: { ...plainUser.userData },
      confirmationData: {
        ...plainUser.confirmationData,
        passwordRecoveryCode: uuidv4(),
        passwordRecoveryCodeExpirationDate: add(new Date(), {
          hours: 1,
          minutes: 1,
        }),
        isPasswordRecoveryConfirmed: false,
      }
    }

    await authCommandRepository.updateUser({ 'userData.email': email }, updateUserData)

    try {
      const mailInfo = await emailManager.sendPasswordRecoveryEmail(email, updateUserData.confirmationData.passwordRecoveryCode!)
      console.log('@> Information::mailInfo: ', mailInfo)
    } catch (err) {
      console.error('@> Error::emailManager: ', err)
    }

    return operationsResultService.generateResponse(ResultToRouterStatus.SUCCESS)
  },
  async recoverUserPassword(newPassword: string, recoveryCode: string) {
    const userToConfirm = await authQueryRepository.getUserByPasswordRecoveryConfirmationCode(recoveryCode)

    if (!userToConfirm || userToConfirm.confirmationData.passwordRecoveryCode !== recoveryCode) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Incorrect verification code', field: 'recoveryCode' }),
      }
    }
    if (userToConfirm.confirmationData.isPasswordRecoveryConfirmed) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Registration was already confirmed', field: 'recoveryCode' }),
      }
    }
    if (userToConfirm.confirmationData.passwordRecoveryCodeExpirationDate && userToConfirm.confirmationData.passwordRecoveryCodeExpirationDate < new Date()) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Confirmation code expired', field: 'recoveryCode' }),
      }
    }

    const plainUserToConfirm = userToConfirm.toObject()
    const passwordHash = await cryptService.generateHash(newPassword)
    const updatedUser: UserDbModel = {
      userData: {
        ...plainUserToConfirm.userData,
        passwordHash
      },
      confirmationData: {
        ...plainUserToConfirm.confirmationData,
        isPasswordRecoveryConfirmed: true,
      }
    }

    await authCommandRepository.updateUser({ 'userData.email': userToConfirm.userData.email }, updatedUser)

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: null,
    }
  },
  async confirmUser(confirmationCode: string): Promise<ResultToRouter<ErrorMessageHandleResult | null>> {
    const userToConfirm = await authQueryRepository.getUserByConfirmationCode(confirmationCode)

    if (!userToConfirm || userToConfirm.confirmationData.confirmationCode !== confirmationCode) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Incorrect verification code', field: 'code' }),
      }
    }
    if (userToConfirm.confirmationData.isConfirmed) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Registration was already confirmed', field: 'code' }),
      }
    }
    if (userToConfirm.confirmationData.confirmationCodeExpirationDate < new Date()) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Confirmation code expired', field: 'code' }),
      }
    }

    const confirmationResult = await authCommandRepository.confirmUser(confirmationCode)
    if (!confirmationResult) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Ups! Something goes wrong...', field: 'code' }),
      }
    }

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: null,
    }
  },
  async resendConfirmationCode(email: string) {
    const user = await authQueryRepository.getUserByLoginOrEmail(email)

    if (!user) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'You have not registered yet', field: 'email' }),
      }
    }
    if (user.confirmationData.isConfirmed) {
      return {
        status: ResultToRouterStatus.BAD_REQUEST,
        data: errorMessagesHandleService({ message: 'Registration was already confirmed', field: 'email' }),
      }
    }
    // if (user.confirmationData.confirmationCodeExpirationDate > new Date()) {
    //   return {
    //     status: ResultToRouterStatus.BAD_REQUEST,
    //     data: errorMessagesHandleService({ message: 'Confirmation code is not expired yet. Check your email', field: 'code' }),
    //   }
    // }

    const updatedUser: UserDbModel = {
      ...user,
      confirmationData: {
        ...user.confirmationData,
        confirmationCode: uuidv4(),
        confirmationCodeExpirationDate: add(new Date(), {
          hours: 1,
          minutes: 1,
        }),
      },
    }

    await authCommandRepository.updateUser({ 'userData.email': email }, updatedUser)

    try {
      const mailInfo = await emailManager.resendRegistrationEmail(email, updatedUser.confirmationData.confirmationCode)
      console.log('@> Information::mailInfo: ', mailInfo)
    } catch (err) {
      console.error('@> Error::emailManager: ', err)
    }

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: null,
    }
  },
  async createAuthSession(refreshToken: string, userId: string, deviceName: string, ip: string) {
    const tokenData = await this.getTokenData(refreshToken)

    if (!tokenData) {
      return
    }

    const authSession: AuthSessionsDbModel = {
      userId,
      ip,
      deviceName,
      deviceId: tokenData.deviceId,
      iat: tokenData.iat!,
      exp: tokenData.exp!,
    }

    await authCommandRepository.createAuthSession(authSession)
  },
  async updateAuthSession(userId: string, refreshToken: string) {
    const updatedTokenData = await this.getTokenData(refreshToken)
    if (!updatedTokenData) {
      return
    }
    await authCommandRepository.updateAuthSession(userId, updatedTokenData.deviceId, updatedTokenData?.iat ?? 0)
  },
  async getTokenData(refreshToken: string) {
    return await jwtService.decodeToken(refreshToken)
  },
}
