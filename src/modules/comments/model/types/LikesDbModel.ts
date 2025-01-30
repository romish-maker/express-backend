import { LikeStatuses } from '../enums/LikeStatuses'

export type LikesDbModel = {
  userId: string
  userLogin: string
  status: LikeStatuses
  parentId: string
  createdAt: Date
}
