import { LikeStatuses } from '../../../comments'

export type PostsLikesInfoModel = {
  likesCount?: number
  dislikesCount?: number
  myStatus?: LikeStatuses
  newestLikes?: SingleLikeModel[]
}

export type SingleLikeModel = {
  addedAt?: string
  userId?: string
  login?: string
}
