import { Request, Response, Router } from 'express'
import { RequestBody } from '../../common/types'
import { AuthInputModel } from '../model/types/AuthInputModel'
import { authService } from '../model/services/authService'
import { HttpStatusCode } from '../../common/enums'
import {
  authCodeValidation,
  authPostValidation,
  isEmailValidation,
  passwordRecoveryValidation,
  resentEmailValidation,
} from '../validations/authValidations'
import { authQueryRepository } from '../model/repositories/authQueryRepository'
import { jwtAuthMiddleware, rateLimitMiddleware } from '../../../app/config/middleware'
import { UserInputModel, userInputValidation } from '../../users'
import { ResultToRouterStatus } from '../../common/enums/ResultToRouterStatus'
import { NewPasswordRecoveryInputModel } from '../model/types/NewPasswordRecoveryInputModel'

export const authRouter = Router()

authRouter.post('/login', rateLimitMiddleware, authPostValidation(), async (req: RequestBody<AuthInputModel>, res: Response) => {
  const deviceName = req.headers['user-agent'] ?? 'Your device'
  const ip = req.ip ?? 'no_ip'
  const tokens = await authService.createTokenPair(req.body.loginOrEmail, req.body.password, deviceName, ip)

  if (!tokens) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true,secure: true })
  return res.status(HttpStatusCode.OK_200).send({ accessToken: tokens.accessToken })
})

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
    return
  }

  const updateTokensResult = await authService.updateTokenPair(refreshToken)

  if (updateTokensResult.status === ResultToRouterStatus.NOT_AUTHORIZED) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
    return
  }

  res.cookie('refreshToken', updateTokensResult.data?.refreshToken, { httpOnly: true,secure: true })
  return res.status(HttpStatusCode.OK_200).send({ accessToken: updateTokensResult.data?.accessToken })
})

authRouter.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
    return
  }

  const logoutResult = await authService.logoutUser(refreshToken)

  if (logoutResult.status === ResultToRouterStatus.NOT_AUTHORIZED) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
    return
  }

  res.clearCookie('refreshToken')
  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

authRouter.get('/me', jwtAuthMiddleware , async (req: Request, res) => {
  const userId = req.userId

  if (!userId) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const user = await authQueryRepository.getUserMeModelById(userId)

  if (!user) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  return res.status(HttpStatusCode.OK_200).send(user)
})

authRouter.post('/registration', rateLimitMiddleware, userInputValidation(), async (req: RequestBody<UserInputModel>, res: Response) => {
  await authService.registerUser(req.body)

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

authRouter.post('/password-recovery', rateLimitMiddleware, isEmailValidation(), async (req: RequestBody<{ email: string }>, res: Response) => {

  await authService.sendPasswordRecoveryEmail(req.body.email)

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

authRouter.post('/new-password', rateLimitMiddleware, passwordRecoveryValidation(), async (req: RequestBody<NewPasswordRecoveryInputModel>, res: Response) => {
  const recoveryResult = await authService.recoverUserPassword(req.body.newPassword, req.body.recoveryCode)

  if (recoveryResult.status === ResultToRouterStatus.BAD_REQUEST) {
    return res.status(HttpStatusCode.BAD_REQUEST_400).send(recoveryResult.data)
  }

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

authRouter.post('/registration-confirmation', rateLimitMiddleware, authCodeValidation(), async (req: RequestBody<{ code: string }>, res: Response) => {
  const confirmationResult = await authService.confirmUser(req.body.code)

  if (confirmationResult.status === ResultToRouterStatus.BAD_REQUEST) {
    return res.status(HttpStatusCode.BAD_REQUEST_400).send(confirmationResult.data)
  }

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

authRouter.post('/registration-email-resending', rateLimitMiddleware, resentEmailValidation(), async (req: RequestBody<{ email: string }>, res: Response) => {
  const resendResult = await authService.resendConfirmationCode(req.body.email)

  if (resendResult.status === ResultToRouterStatus.BAD_REQUEST) {
    return res.status(HttpStatusCode.BAD_REQUEST_400).send(resendResult.data)
  }

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})
