import { app } from '../../../../app/app'
import { usersTestManager } from '../../../users/utils/testing/usersTestManager'
import { RoutesList } from '../../../../app/config/routes'
import { userInputMock } from '../../../users'
import { HttpStatusCode } from '../../../common/enums'

const supertest = require('supertest')

const request = supertest(app)

class AuthTestManager {
  async loginUser() {
    const createUser = await usersTestManager.createUser()

    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)

    return resultLogin
  }
}

export const authTestManager = new AuthTestManager()
