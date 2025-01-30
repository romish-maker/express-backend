import { app } from '../../../app/app'
import { memoryService } from '../../common/services'
import { RoutesList } from '../../../app/config/routes'
import { authTestManager } from '../../auth/utils/testing/authTestManager'
import { HttpStatusCode } from '../../common/enums'
import { testingUtils } from '../../common/testing'

const supertest = require('supertest')

const request = supertest(app)

describe('/auth/me route e2e tests: ', () => {
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

  it('GET /devices success', async () => {
    const resultLogin = await authTestManager.loginUser()

    const cookies = resultLogin.headers['set-cookie']
    const refreshToken = testingUtils.getRefreshTokenFromResponseCookies(cookies)

    const devices = await request.get(RoutesList.DEVICES)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatusCode.OK_200)

    expect(devices.body.length).toBe(1)
    expect(devices.body[0].deviceId).toStrictEqual(expect.any(String))
  })

  it('DELETE /devices/:id success', async () => {
    const resultLogin = await authTestManager.loginUser()

    const cookies = resultLogin.headers['set-cookie']
    const refreshToken = testingUtils.getRefreshTokenFromResponseCookies(cookies)

    const devices = await request.get(RoutesList.DEVICES)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatusCode.OK_200)

    const deviceId = devices.body[0].deviceId

    await request.delete(`${RoutesList.DEVICES}/${deviceId}`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatusCode.NO_CONTENT_204)

    await request.get(RoutesList.DEVICES)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .expect(HttpStatusCode.UNAUTHORIZED_401)
  })
})
