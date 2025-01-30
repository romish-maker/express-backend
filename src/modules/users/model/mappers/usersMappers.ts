import { UserDbModel } from '../types/UserDbModel'
import { UserViewModel } from '../types/UserViewModel'
import { WithId } from 'mongodb'

export const usersMappers = {
  mapUserDbToViewDTO(dBUser: WithId<UserDbModel>): UserViewModel  {
    return {
      id: dBUser._id.toString(),
      login: dBUser.userData.login,
      email: dBUser.userData.email,
      createdAt: dBUser.userData.createdAt,
    }
  }
}
