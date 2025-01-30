import { app } from '../../../app/app'
import { RoutesList } from '../../../app/config/routes'
import { userInputMock } from '../../users'
import { HttpStatusCode } from '../../common/enums'
import { usersTestManager } from '../../users/utils/testing/usersTestManager'
import { memoryService } from '../../common/services'

const supertest = require('supertest')

const request = supertest(app)

describe('/auth/me route e2e tests: ', () => {
  beforeAll(async ()=> {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('GET /auth/me success', async () => {
    const createUser = await usersTestManager.createUser()

    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)

    const meData = await request.get(`${RoutesList.AUTH}/me`)
      .auth(resultLogin.body.accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.OK_200)

    expect(meData.body.login).toBe(createUser.body.login)
    expect(meData.body.email).toBe(createUser.body.email)
  })

  it('GET /auth/me failed', async () => {
    const meData = await request.get(`${RoutesList.AUTH}/me`)
      .auth('someWrongToken', { type: 'bearer' })
      .expect(HttpStatusCode.UNAUTHORIZED_401)

    expect(meData.body.login).toBe(undefined)
  })

  it('POST /auth/login success', async () => {
    const createUser = await usersTestManager.createUser()

    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)

    const cookies = resultLogin.headers['set-cookie']

    expect(resultLogin.body.accessToken).toStrictEqual(expect.any(String))
    expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBeTruthy()
  })

  it('POST /auth/refresh-token success', async () => {
    const createUser = await usersTestManager.createUser()

    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)


    const cookies = resultLogin.headers['set-cookie']
    const refreshCookie = cookies.find((cookie: string) => cookie.includes('refreshToken'))
    const indexStartToken = refreshCookie?.indexOf('=')
    const indexEndToken = refreshCookie?.indexOf(';')
    const refreshToken = refreshCookie?.slice(indexStartToken + 1, indexEndToken)

    expect(resultLogin.body.accessToken).toStrictEqual(expect.any(String))
    expect(refreshToken).toStrictEqual(expect.any(String))
    expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBeTruthy()

    const refreshResult = await request.post(`${RoutesList.AUTH}/refresh-token`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .send({})
      .expect(HttpStatusCode.OK_200)

    expect(refreshResult.body.accessToken).toStrictEqual(expect.any(String))
  })

  it('POST /auth/logout success', async () => {
    const createUser = await usersTestManager.createUser()

    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)


    const cookies = resultLogin.headers['set-cookie']
    const refreshCookie = cookies.find((cookie: string) => cookie.includes('refreshToken'))
    const indexStartToken = refreshCookie?.indexOf('=')
    const indexEndToken = refreshCookie?.indexOf(';')
    const refreshToken = refreshCookie?.slice(indexStartToken + 1, indexEndToken)

    expect(resultLogin.body.accessToken).toStrictEqual(expect.any(String))
    expect(refreshToken).toStrictEqual(expect.any(String))
    expect(cookies.some((cookie: string) => cookie.includes('refreshToken'))).toBeTruthy()

    await request.post(`${RoutesList.AUTH}/logout`)
      .set('Cookie', `refreshToken=${refreshToken}`)
      .send({})
      .expect(HttpStatusCode.NO_CONTENT_204)
  })
})
