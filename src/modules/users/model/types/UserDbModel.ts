import { UserDataModel } from './UserDataModel'
import { ConfirmationInfoModel } from './ConfirmationInfoModel'

export type UserDbModel = {
  userData: UserDataModel
  confirmationData: ConfirmationInfoModel
}
