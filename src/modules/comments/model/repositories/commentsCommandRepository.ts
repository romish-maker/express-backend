import { CommentsMongooseModel, LikesMongooseModel } from '../../../../app/config/db'
import { CommentDbModel } from '../types/CommentDbModel'
import { LikesDbModel } from '../types/LikesDbModel'

export const commentsCommandRepository = {
  async updateComment(commentId: string, updatedComment: CommentDbModel) {
    const result = await CommentsMongooseModel.updateOne(
      { _id: commentId },
      updatedComment,
    )

    return Boolean(result.matchedCount)
  },
  async deleteComment(commentId: string) {
    const result = await CommentsMongooseModel.deleteOne({ _id: commentId })

    return Boolean(result.deletedCount)
  },
  async createLikeStatus(createLikeStatusDto: LikesDbModel) {
    const createResult = await LikesMongooseModel.create(createLikeStatusDto)

    return createResult._id.toString()
  },
  async updateLikeStatus(updatedLikeStatusDto: LikesDbModel) {
    const updateResult = await LikesMongooseModel.updateOne({ userId: updatedLikeStatusDto.userId }, updatedLikeStatusDto)

    return Boolean(updateResult.matchedCount)
  },
}
