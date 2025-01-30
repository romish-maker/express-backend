import { LikeStatuses } from '../enums/LikeStatuses'

export type CommentLikesInfoModel = {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatuses
}
