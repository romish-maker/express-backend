import { CommentDbModel } from '../types/CommentDbModel'
import { CommentViewModel } from '../types/CommentViewModel'
import { WithId } from 'mongodb'
import { LikesDbModel } from '../types/LikesDbModel'
import { LikeStatuses } from '../enums/LikeStatuses'

export const commentsMappers = {
  mapCommentDtoToViewModel(commentFromDb: WithId<CommentDbModel>, likeStatus: LikesDbModel | null): CommentViewModel {
    return {
      id: commentFromDb._id.toString(),
      content: commentFromDb.content,
      commentatorInfo: {
        userId: commentFromDb.commentatorInfo.userId,
        userLogin: commentFromDb.commentatorInfo.userLogin,
      },
      createdAt: commentFromDb.createdAt,
      likesInfo: {
        likesCount: commentFromDb.likesCount,
        dislikesCount: commentFromDb.dislikesCount,
        myStatus: likeStatus?.status ?? LikeStatuses.NONE,
      }
    }
  }
}
