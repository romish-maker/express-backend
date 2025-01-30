import { WithId } from 'mongodb'
import { UserDbModel } from '../../../users'
import { MeViewModel } from '../types/MeViewModel'

export const authMappers = {
  mapDbUserToMeModel(user: WithId<UserDbModel>): MeViewModel {
    return {
      userId: user._id.toString(),
      login: user.userData.login,
      email: user.userData.email,
    }
  }
}
