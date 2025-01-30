import { CommentatorInfoModel } from './CommentatorInfoModel'

export type CommentDbModel = {
  postId: string
  content: string
  commentatorInfo: CommentatorInfoModel
  createdAt: string
  likesCount: number
  dislikesCount: number
}
