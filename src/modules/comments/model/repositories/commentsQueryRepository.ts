import { CommentsMongooseModel, LikesMongooseModel } from '../../../../app/config/db'
import { commentsMappers } from '../mappers/commentsMappers'
import { ResultToRouterStatus } from '../../../common/enums/ResultToRouterStatus'

export const commentsQueryRepository = {
  async getCommentById(commentId: string, userId?: string | null) {
    const comment = await CommentsMongooseModel.findOne({ _id: commentId })
    const likeStatus = userId ? await this.getLikeStatus(userId, commentId) : null

    if (!comment) {
      return {
        status: ResultToRouterStatus.NOT_FOUND,
      }
    }

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: commentsMappers.mapCommentDtoToViewModel(comment, likeStatus),
    }
  },
  async getLikeStatus(userId: string, commentId: string) {
    return LikesMongooseModel.findOne({ userId, parentId: commentId })
  },
  async getCommentDbModelById(commentId: string) {
    const comment = await CommentsMongooseModel.findOne({ _id: commentId })

    if (!comment) {
      return {
        status: ResultToRouterStatus.NOT_FOUND,
      }
    }

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: comment,
    }
  }
}
