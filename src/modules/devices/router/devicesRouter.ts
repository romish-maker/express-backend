import { Router } from 'express'
import { devicesQueryRepository } from '../model/repositories/devicesQueryRepository'
import { HttpStatusCode } from '../../common/enums'
import { devicesService } from '../model/services/devicesService'
import { RequestParams } from '../../common/types'

export const devicesRouter = Router()

devicesRouter.get('/', async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const authSession = await devicesService.checkAuthSessionByRefreshToken(refreshToken)
  if (!authSession) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }
  const userDevices = await devicesQueryRepository.getDevices(authSession.userId)
  return res.status(HttpStatusCode.OK_200).send(userDevices)
})

devicesRouter.delete('/', async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const authSession = await devicesService.checkAuthSessionByRefreshToken(refreshToken)
  if (!authSession) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const deletedCount = await devicesService.deleteAllOtherSessions(authSession.deviceId, refreshToken)

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})

devicesRouter.delete('/:deviceId', async (req: RequestParams<{ deviceId: string }>, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const authSession = await devicesService.checkAuthSessionByRefreshToken(refreshToken)
  if (!authSession) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)
  }

  const deletedAuthSession = await devicesQueryRepository.getAuthSessionByDeviceId(req.params.deviceId)
  if (!deletedAuthSession) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
  }
  if (deletedAuthSession.userId !== authSession.userId) {
    return res.sendStatus(HttpStatusCode.FORBIDDEN_403)
  }

  const isDeleted = await devicesService.deleteSessionByDeviceId(req.params.deviceId)
  if (!isDeleted) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
  }

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})
