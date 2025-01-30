import { app } from '../../../app/app'
import { memoryService } from '../../common/services'
import { RoutesList } from '../../../app/config/routes'
import { emailManager } from '../../common/managers/emailManager'
import { authService } from '../model/services/authService'
import { createTestUserFromDb, createTestUserInputData } from '../mocks'
import { ResultToRouterStatus } from '../../common/enums/ResultToRouterStatus'
import { authQueryRepository } from '../model/repositories/authQueryRepository'
import { authCommandRepository } from '../model/repositories/authCommandRepository'
import { errorMessagesHandleService } from '../../common/services/errorMessagesHandleService'
import { add } from 'date-fns'

const supertest = require('supertest')

const request = supertest(app)

describe('auth command repo integration tests: ', () => {
  beforeAll(async () => {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('register user send email success', async () => {
    const registerUserUseCase = authService.registerUser
    const userInputData = createTestUserInputData()

    emailManager.sendRegistrationEmail = jest.fn().mockImplementation((email: string, confirmationCode: string) => {
      return 'Email send success'
    })

    const result = await registerUserUseCase(userInputData)

    expect(result.status).toBe(ResultToRouterStatus.SUCCESS)
    expect(emailManager.sendRegistrationEmail).toHaveBeenCalledTimes(1)
    expect(emailManager.sendRegistrationEmail).toHaveBeenCalledWith(userInputData.email, expect.any(String))
  })

  it('confirm user email success', async () => {
    const confirmUserEmailUseCase = authService.confirmUser
    const user = createTestUserFromDb()

    authQueryRepository.getUserByConfirmationCode = jest.fn().mockImplementation((confirmationCode: string) => {
      return user
    })
    authCommandRepository.confirmUser = jest.fn().mockImplementation((confirmationCode: string) => {
      return true
    })

    const result = await confirmUserEmailUseCase(user.confirmationData.confirmationCode)

    expect(result.status).toBe(ResultToRouterStatus.SUCCESS)
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledTimes(1)
    expect(authCommandRepository.confirmUser).toHaveBeenCalledTimes(1)
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledWith(user.confirmationData.confirmationCode)
    expect(authCommandRepository.confirmUser).toHaveBeenCalledWith(user.confirmationData.confirmationCode)
  })

  it('confirm user email failed::wrongCode', async () => {
    const confirmUserEmailUseCase = authService.confirmUser
    const user = createTestUserFromDb()
    const wrongConfirmationCode = '1231-1231-1231-1231'

    authQueryRepository.getUserByConfirmationCode = jest.fn().mockImplementation((confirmationCode: string) => {
      return user
    })
    authCommandRepository.confirmUser = jest.fn().mockImplementation((confirmationCode: string) => {
      return true
    })

    const result = await confirmUserEmailUseCase(wrongConfirmationCode)

    expect(result.status).toBe(ResultToRouterStatus.BAD_REQUEST)
    expect(result.data).toStrictEqual(errorMessagesHandleService({ message: 'Incorrect verification code', field: 'code' }))
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledTimes(1)
    expect(authCommandRepository.confirmUser).toHaveBeenCalledTimes(0)
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledWith(wrongConfirmationCode)
  })

  it('confirm user email failed::alreadyConfirmed', async () => {
    const confirmUserEmailUseCase = authService.confirmUser
    const user = createTestUserFromDb({ isConfirmed: true })

    authQueryRepository.getUserByConfirmationCode = jest.fn().mockImplementation((confirmationCode: string) => {
      return user
    })
    authCommandRepository.confirmUser = jest.fn().mockImplementation((confirmationCode: string) => {
      return true
    })

    const result = await confirmUserEmailUseCase(user.confirmationData.confirmationCode)

    expect(result.status).toBe(ResultToRouterStatus.BAD_REQUEST)
    expect(result.data).toStrictEqual(errorMessagesHandleService({ message: 'Registration was already confirmed', field: 'code' }))
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledTimes(1)
    expect(authCommandRepository.confirmUser).toHaveBeenCalledTimes(0)
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledWith(user.confirmationData.confirmationCode)
  })

  it('confirm user email failed::codeExpired', async () => {
    const confirmUserEmailUseCase = authService.confirmUser
    const user = createTestUserFromDb({ expDate: add(new Date(), { minutes: -5 }) })

    authQueryRepository.getUserByConfirmationCode = jest.fn().mockImplementation((confirmationCode: string) => {
      return user
    })
    authCommandRepository.confirmUser = jest.fn().mockImplementation((confirmationCode: string) => {
      return true
    })

    const result = await confirmUserEmailUseCase(user.confirmationData.confirmationCode)

    expect(result.status).toBe(ResultToRouterStatus.BAD_REQUEST)
    expect(result.data).toStrictEqual(errorMessagesHandleService({ message: 'Confirmation code expired', field: 'code' }))
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledTimes(1)
    expect(authCommandRepository.confirmUser).toHaveBeenCalledTimes(0)
    expect(authQueryRepository.getUserByConfirmationCode).toHaveBeenCalledWith(user.confirmationData.confirmationCode)
  })

  it('resend user confirmation email success', async () => {
    const resendUserConfirmationCodeUseCase = authService.resendConfirmationCode
    const user = createTestUserFromDb()

    emailManager.resendRegistrationEmail = jest.fn().mockImplementation((email: string, confirmationCode: string) => {
      return 'Email send success'
    })
    authQueryRepository.getUserByLoginOrEmail = jest.fn().mockImplementation((email: string) => {
      return user
    })

    const result = await resendUserConfirmationCodeUseCase(user.userData.email)

    expect(result.status).toBe(ResultToRouterStatus.SUCCESS)
    expect(emailManager.resendRegistrationEmail).toHaveBeenCalledTimes(1)
    expect(authQueryRepository.getUserByLoginOrEmail).toHaveBeenCalledTimes(1)
    expect(emailManager.resendRegistrationEmail).toHaveBeenCalledWith(user.userData.email, expect.any(String))
    expect(authQueryRepository.getUserByLoginOrEmail).toHaveBeenCalledWith(user.userData.email)
  })
})
