import { UsersMongooseModel } from '../../../../app/config/db'
import { UserDbModel } from '../types/UserDbModel'

export const usersCommandRepository = {
  async createUser(newUser: UserDbModel): Promise<string> {
    const createUserData = await UsersMongooseModel.create(newUser)

    return createUserData._id.toString()
  },
  async deleteUser(userId: string) {
    const deleteResult = await UsersMongooseModel.deleteOne({ _id: userId })

    return Boolean(deleteResult.deletedCount)
  }
}
