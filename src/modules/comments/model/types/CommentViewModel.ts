import { CommentatorInfoModel } from './CommentatorInfoModel'
import { CommentLikesInfoModel } from './CommentLikesInfoModel'

export type CommentViewModel = {
  id: string
  content: string
  commentatorInfo: CommentatorInfoModel
  createdAt: string
  likesInfo?: CommentLikesInfoModel
}
