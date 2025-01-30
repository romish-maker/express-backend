import { RoutesList } from '../../../../app/config/routes'
import { HttpStatusCode } from '../../../common/enums'
import { app } from '../../../../app/app'
import { userInputMock } from '../../mocks/usersMock'
import { UsersMongooseModel } from '../../../../app/config/db'
import { ObjectId } from 'mongodb'

const supertest = require('supertest')

const request = supertest(app)

class UsersTestManager {
  async createUser(payload: {
    shouldExpect?: boolean
    user?: string
    password?: string
    expectedStatusCode?: HttpStatusCode
    checkedData?: { field: string, value: any }
  } = {}) {
    const {
      shouldExpect = false,
      user = 'admin',
      password = 'qwerty',
      expectedStatusCode = HttpStatusCode.CREATED_201,
      checkedData,
    } = payload

    const result = await request.post(RoutesList.USERS)
      .auth(user, password)
      .send(checkedData
        ? { ...userInputMock, [checkedData.field]: checkedData.value }
        : userInputMock )
      .expect(expectedStatusCode)

    if (shouldExpect && expectedStatusCode === HttpStatusCode.CREATED_201) {
      const user = await UsersMongooseModel.findOne({ _id: result.body.id })

      expect(result.body.email).toBe(userInputMock.email)
      expect(result.body.login).toBe(userInputMock.login)
      expect(ObjectId.isValid(user?._id ?? '')).toBeTruthy()
    }

    if (shouldExpect && expectedStatusCode === HttpStatusCode.BAD_REQUEST_400 && checkedData?.field) {
      const users = await UsersMongooseModel.find({})

      expect(result.body.errorsMessages.length).toBe(1)
      expect(result.body.errorsMessages[0].field).toBe(checkedData.field)
      expect(result.body.errorsMessages[0].message).toStrictEqual(expect.any(String))
      expect(users.length).toBe(0)
    }

    return result
  }
}

export const usersTestManager = new UsersTestManager()
